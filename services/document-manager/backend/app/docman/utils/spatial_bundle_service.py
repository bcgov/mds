import os
import tempfile
from collections import defaultdict
from datetime import datetime

from app.docman.models.document import Document
from app.docman.models.document_bundle import DocumentBundle
from app.docman.utils.document_upload_helper import DocumentUploadHelper
from app.docman.utils.geomark_helper import GeomarkHelper
from app.extensions import db
from app.utils.include.user_info import User
from flask import current_app
from werkzeug.exceptions import BadRequest, NotFound
from werkzeug.utils import secure_filename

SYSTEM_USER = 'mds'

VALIDATION_STATUS_VALID = 'VALID'
VALIDATION_STATUS_INVALID = 'INVALID'
VALIDATION_STATUS_UNABLE_TO_VALIDATE = 'UNABLE_TO_VALIDATE'

REQUIRED_SHAPEFILE_EXTENSIONS = {'.shp', '.shx', '.dbf', '.prj'}
OPTIONAL_SHAPEFILE_EXTENSIONS = {'.sbn', '.sbx', '.xml'}
ALL_SHAPEFILE_EXTENSIONS = REQUIRED_SHAPEFILE_EXTENSIONS | OPTIONAL_SHAPEFILE_EXTENSIONS
SINGLE_FILE_EXTENSIONS = {'.kml', '.kmz'}
SPATIAL_EXTENSIONS = ALL_SHAPEFILE_EXTENSIONS | SINGLE_FILE_EXTENSIONS

BC_INTERSECT_ERROR_FRAGMENT = 'intersect the Province of British Columbia'
OUT_OF_AREA_ERROR_FRAGMENT = 'outside the valid area'


class SpatialBundleService:
    """Shared spatial detect / validate / Geomark pipeline.

    Modes:
      blocking=True  — raise BadRequest on INVALID (MMA / Project Summary upload)
      blocking=False — always return a result dict; never fail the parent job (NoW import)
    """

    @classmethod
    def _audit_user(cls):
        """The AuditMixin defaults read the request's token; Celery tasks have no request."""
        try:
            return User().get_user_username()
        except Exception:
            return SYSTEM_USER

    @classmethod
    def _new_bundle(cls, name, error=None):
        user = cls._audit_user()
        return DocumentBundle(name=name, error=error, create_user=user, update_user=user)

    @classmethod
    def _link_documents(cls, bundle, bundle_documents, set_upload_completed=False):
        user = cls._audit_user()
        for doc in bundle_documents:
            doc.document_bundle = bundle
            doc.update_user = user
            if set_upload_completed:
                doc.upload_completed_date = datetime.utcnow()
            db.session.add(doc)
        db.session.add(bundle)
        db.session.commit()

    @classmethod
    def is_spatial_filename(cls, filename):
        if not filename:
            return False
        ext = os.path.splitext(filename)[1].lower()
        return ext in SPATIAL_EXTENSIONS

    @classmethod
    def group_documents_by_basename(cls, documents):
        """Group Document (or objects with file_display_name) into spatial bundles by basename."""
        singles = []
        groups = defaultdict(list)

        for doc in documents:
            name = getattr(doc, 'file_display_name', None) or getattr(doc, 'document_name', None) or ''
            if not cls.is_spatial_filename(name):
                continue
            basename, ext = os.path.splitext(name)
            ext = ext.lower()
            if ext in SINGLE_FILE_EXTENSIONS:
                singles.append([doc])
            else:
                groups[basename].append(doc)

        shapefile_groups = []
        for group in groups.values():
            extensions = {
                os.path.splitext(
                    getattr(d, 'file_display_name', None) or getattr(d, 'document_name', '') or ''
                )[1].lower()
                for d in group
            }
            # .xml/.sbn/.sbx are sidecars; a lone report.xml is not a spatial bundle.
            if extensions & REQUIRED_SHAPEFILE_EXTENSIONS:
                shapefile_groups.append(group)
        return shapefile_groups + singles

    @classmethod
    def analyze_group(cls, bundle_documents):
        """Return local validation info without calling Geomark."""
        names = [
            getattr(d, 'file_display_name', None) or getattr(d, 'document_name', '')
            for d in bundle_documents
        ]
        extensions = {os.path.splitext(n)[1].lower() for n in names}
        basename = os.path.splitext(names[0])[0] if names else 'spatial'

        if len(bundle_documents) == 1 and extensions.issubset(SINGLE_FILE_EXTENSIONS):
            return {
                'name': names[0],
                'is_single_file': True,
                'missing_extensions': [],
                'extra_extensions': [],
                'found_extensions': sorted(extensions),
                'complete': True,
            }

        missing = sorted(REQUIRED_SHAPEFILE_EXTENSIONS - extensions)
        extra = sorted(extensions - ALL_SHAPEFILE_EXTENSIONS)
        return {
            'name': basename,
            'is_single_file': False,
            'missing_extensions': missing,
            'extra_extensions': extra,
            'found_extensions': sorted(extensions),
            'complete': len(missing) == 0 and len(extra) == 0,
        }

    @classmethod
    def _empty_checks(cls, **overrides):
        checks = {
            'in_bc': None,
            'bc_albers': None,
            'file_size_gt_0': None,
            'missing_extensions': [],
        }
        checks.update(overrides)
        return checks

    @classmethod
    def _map_geomark_error(cls, error_text):
        """Map Geomark error text to validation_checks flags."""
        checks = cls._empty_checks(file_size_gt_0=True)
        error_lower = (error_text or '').lower()
        if BC_INTERSECT_ERROR_FRAGMENT.lower() in error_lower:
            checks['in_bc'] = False
        elif OUT_OF_AREA_ERROR_FRAGMENT in error_lower:
            checks['bc_albers'] = False
        return checks

    @classmethod
    def _temporary_file_path(cls, suffix):
        os.makedirs('/tmp/spatial', exist_ok=True)
        file_descriptor, file_path = tempfile.mkstemp(
            prefix='spatial-', suffix=suffix, dir='/tmp/spatial')
        os.close(file_descriptor)
        return file_path

    @classmethod
    def _result_dict(cls,
                     name,
                     document_guids,
                     status,
                     error,
                     checks,
                     geomark_id=None,
                     docman_bundle_guid=None):
        return {
            'name': name,
            'geomark_id': geomark_id,
            'docman_bundle_guid': docman_bundle_guid,
            'document_guids': document_guids,
            'validation_status': status,
            'validation_error': error,
            'validation_checks': checks,
        }

    @classmethod
    def _existing_bundle(cls, bundle_documents):
        """The bundle this group already belongs to, if they all agree on one."""
        bundles = [
            bundle for bundle in (
                getattr(doc, 'document_bundle', None) for doc in bundle_documents)
            if bundle is not None
        ]
        if not bundles or any(bundle is not bundles[0] for bundle in bundles):
            return None
        return bundles[0]

    @classmethod
    def _attach_bundle(cls, result, bundle_documents, set_upload_completed=False):
        """Write the result onto the group's bundle, reusing it when reprocessing."""
        bundle = cls._existing_bundle(bundle_documents)
        if bundle is None:
            bundle = cls._new_bundle(result['name'])
        else:
            bundle.name = result['name']
            bundle.update_user = cls._audit_user()
        # Assigned unconditionally so a failed revalidation drops a stale geomark.
        bundle.error = result.get('validation_error')
        bundle.geomark_id = result.get('geomark_id')
        cls._link_documents(bundle, bundle_documents, set_upload_completed=set_upload_completed)
        result['docman_bundle_guid'] = str(bundle.bundle_guid)
        return result

    @classmethod
    def process_document_group(cls, bundle_documents, name=None, blocking=True):
        """Validate and optionally Geomark a group of Document records.

        Returns dict:
          name, geomark_id, docman_bundle_guid, document_guids,
          validation_status, validation_error, validation_checks
        """
        if not bundle_documents:
            raise ValueError('No documents provided')

        analysis = cls.analyze_group(bundle_documents)
        bundle_name = name or analysis['name']
        document_guids = [str(d.document_guid) for d in bundle_documents]

        checks = cls._empty_checks(missing_extensions=analysis['missing_extensions'])

        if not analysis['complete']:
            if analysis['extra_extensions']:
                validation_error = (
                    'Found non spatial bundle file types in spatial bundle: '
                    f"{', '.join(analysis['extra_extensions'])}"
                )
            else:
                validation_error = (
                    f"Missing required file types: {', '.join(analysis['missing_extensions'])}"
                )
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_UNABLE_TO_VALIDATE,
                validation_error,
                checks,
            )
            if blocking:
                raise BadRequest(result['validation_error'])
            return cls._attach_bundle(result, bundle_documents)

        file_path = None
        try:
            if analysis['is_single_file']:
                file_path = cls._temporary_file_path(
                    os.path.splitext(secure_filename(bundle_documents[0].file_display_name))[1])
                DocumentUploadHelper.download_kml_kmz_files(bundle_documents[0], file_path)
            else:
                file_path = cls._temporary_file_path('.shpz')
                DocumentUploadHelper.zip_spatial_files(bundle_documents, file_path)

            file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
            if file_size <= 0:
                checks['file_size_gt_0'] = False
                result = cls._result_dict(
                    bundle_name,
                    document_guids,
                    VALIDATION_STATUS_INVALID,
                    'File size must be greater than 0',
                    checks,
                )
                if blocking:
                    raise BadRequest(result['validation_error'])
                return cls._attach_bundle(result, bundle_documents)

            checks['file_size_gt_0'] = True
            geomark_response = GeomarkHelper().send_spatial_file_to_geomark(file_path)
        except BadRequest:
            raise
        except Exception:
            current_app.logger.exception('Spatial bundle processing failed')
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_UNABLE_TO_VALIDATE,
                'Unable to process spatial file.',
                checks,
            )
            if blocking:
                raise BadRequest(result['validation_error'])
            return cls._attach_bundle(result, bundle_documents)
        finally:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)

        if not geomark_response:
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_UNABLE_TO_VALIDATE,
                'Geomark API request failed',
                checks,
            )
        elif geomark_response.get('error'):
            error_text = geomark_response['error']
            current_app.logger.warning(
                f"Geomark rejected spatial bundle '{bundle_name}': {error_text}")
            mapped = cls._map_geomark_error(error_text)
            checks.update({k: v for k, v in mapped.items() if v is not None})
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_INVALID,
                (error_text or 'Geomark validation failed')[:1000],
                checks,
            )
        elif geomark_response.get('id'):
            geomark_id = geomark_response.get('id')
            checks['in_bc'] = True
            checks['bc_albers'] = True
            checks['file_size_gt_0'] = True
            metadata = GeomarkHelper().fetch_geomark_metadata(geomark_id)
            if metadata:
                checks.update(metadata)
            if metadata and metadata.get('isValid') is False:
                geometry_error = metadata.get('validationError') or 'Geometry is not valid'
                result = cls._result_dict(
                    bundle_name,
                    document_guids,
                    VALIDATION_STATUS_INVALID,
                    str(geometry_error)[:1000],
                    checks,
                    geomark_id=geomark_id,
                )
            else:
                result = cls._result_dict(
                    bundle_name,
                    document_guids,
                    VALIDATION_STATUS_VALID,
                    None,
                    checks,
                    geomark_id=geomark_id,
                )
        else:
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_UNABLE_TO_VALIDATE,
                'Unexpected Geomark response',
                checks,
            )

        if blocking and result['validation_status'] != VALIDATION_STATUS_VALID:
            raise BadRequest(result['validation_error'] or 'Spatial validation failed')

        cls._attach_bundle(
            result, bundle_documents, set_upload_completed=bool(result.get('geomark_id')))
        current_app.logger.info(
            f"Completed spatial bundle '{bundle_name}' status={result['validation_status']} "
            f"geomark={result.get('geomark_id')}"
        )
        return result

    @classmethod
    def process_document_guids(cls, bundle_document_guids, name, blocking=True):
        bundle_documents = Document.find_by_document_guid_many(bundle_document_guids)
        if len(bundle_documents) != len(bundle_document_guids) or not bundle_documents:
            raise NotFound('One or more documents not found')
        return cls.process_document_group(bundle_documents, name=name, blocking=blocking)

    @classmethod
    def process_all_spatial_documents(cls, documents, blocking=False):
        """Group and process all spatial documents. Returns list of result dicts."""
        groups = cls.group_documents_by_basename(documents)
        results = []
        for group in groups:
            try:
                results.append(cls.process_document_group(group, blocking=blocking))
            except BadRequest as e:
                if blocking:
                    raise
                current_app.logger.warning(f'Spatial group failed (non-blocking): {e}')
        return results
