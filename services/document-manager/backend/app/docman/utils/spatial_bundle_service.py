import os
import re
import tempfile
import zipfile
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

BC_ALBERS_PROJECTION = 'NAD83 / BC Albers (EPSG:3005)'
WGS84_PROJECTION = 'WGS 84 (EPSG:4326)'

UTM_PROJECTION_DESCRIPTION = 'UTM (northern hemisphere)'
GEOGRAPHIC_PROJECTION_DESCRIPTION = 'geographic latitude/longitude (e.g. WGS 84)'

# Geomark attribution copied into validation_checks for VALID bundles. Anything Geomark
# omits stays None so consumers can skip it.
GEOMARK_METADATA_KEYS = (
    'geometry_type',
    'extent',
    'centroid',
    'num_parts',
    'num_vertices',
    'area',
    'length',
    'minimum_clearance',
    'is_valid',
    'is_simple',
    'is_robust',
    'geometry_validation_error',
)


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
                'found_extensions': sorted(extensions),
                'complete': True,
            }

        missing = sorted(REQUIRED_SHAPEFILE_EXTENSIONS - extensions)
        return {
            'name': basename,
            'is_single_file': False,
            'missing_extensions': missing,
            'found_extensions': sorted(extensions),
            'complete': len(missing) == 0,
        }

    @classmethod
    def _empty_checks(cls, **overrides):
        checks = {
            'in_bc': None,
            'bc_albers': None,
            'file_size_gt_0': None,
            'missing_extensions': [],
            'found_projection': None,
            'declared_projection': None,
            'expected_projection': None,
        }
        checks.update({key: None for key in GEOMARK_METADATA_KEYS})
        checks.update(overrides)
        return checks

    @classmethod
    def _expected_projection(cls, analysis):
        """Geomark is told the file is BC Albers, except KML/KMZ which are WGS 84."""
        name = (analysis.get('name') or '').lower()
        if analysis.get('is_single_file') and (name.endswith('.kml') or name.endswith('.kmz')):
            return WGS84_PROJECTION
        return BC_ALBERS_PROJECTION

    @classmethod
    def _map_geomark_error(cls, error_text, expected_projection=BC_ALBERS_PROJECTION):
        """Map Geomark error text to validation_checks flags."""
        checks = cls._empty_checks(
            file_size_gt_0=True, expected_projection=expected_projection)
        error_lower = (error_text or '').lower()

        if BC_INTERSECT_ERROR_FRAGMENT.lower() in error_lower or 'british columbia' in error_lower:
            checks['in_bc'] = False
            checks['bc_albers'] = True  # CRS accepted enough to evaluate location
            return checks

        found = cls._extract_found_projection(error_text, expected_projection)
        if found or OUT_OF_AREA_ERROR_FRAGMENT in error_lower:
            checks['bc_albers'] = False
            checks['found_projection'] = found

        # Otherwise Geomark could not read the file at all, so the projection remains unknown.
        return checks

    @classmethod
    def _names_projection(cls, candidate, projection_name):
        """True when candidate is a (possibly partial) name for projection_name."""

        def squash(value):
            return re.sub(r'[^a-z0-9]', '', (value or '').lower())

        candidate_squashed = squash(candidate)
        return bool(candidate_squashed) and candidate_squashed in squash(projection_name)

    @classmethod
    def _extract_found_projection(cls, error_text, expected_projection=BC_ALBERS_PROJECTION):
        """Name the projection the data is actually in, never the one we declared to Geomark.

        Geomark echoes the srid we sent it ("Source Geometry Factory: NAD83 / BC Albers"), so any
        match naming the expected projection describes our own request rather than the file.
        """
        if not error_text:
            return None

        for match in re.finditer(r'(NAD83[^\n,()]*|UTM zone[^\n,()]*|EPSG[:\s]?\d+|WGS\s*84)',
                                 error_text, re.I):
            candidate = match.group(1).strip()
            if not cls._names_projection(candidate, expected_projection):
                return candidate

        return cls._infer_projection_from_coordinates(error_text)

    @classmethod
    def _infer_projection_from_coordinates(cls, error_text):
        """Classify the coordinates Geomark echoed back.

        BC Albers northings top out near 1.8 million, so northings in the millions are metres from
        the equator, i.e. UTM.
        """
        coordinate = cls._first_coordinate(error_text)
        if not coordinate:
            return None

        easting, northing = coordinate
        if abs(easting) <= 180 and abs(northing) <= 90:
            return GEOGRAPHIC_PROJECTION_DESCRIPTION
        if 100000 <= abs(easting) <= 1000000 and 3000000 <= abs(northing) <= 10000000:
            return UTM_PROJECTION_DESCRIPTION
        return None

    @classmethod
    def _first_coordinate(cls, error_text):
        bbox = re.search(r'Geometry Bounding Box:[^(\n]*\(\s*(-?[\d.]+)\s+(-?[\d.]+)',
                         error_text, re.I)
        geometry = bbox or re.search(
            r'(?:POLYGON|MULTIPOLYGON|POINT|MULTIPOINT|LINESTRING|MULTILINESTRING)'
            r'[^(]*\(+\s*(-?[\d.]+)\s+(-?[\d.]+)', error_text, re.I)
        if not geometry:
            return None
        try:
            return float(geometry.group(1)), float(geometry.group(2))
        except ValueError:
            return None

    @classmethod
    def _read_declared_projection(cls, file_path, is_single_file=False):
        """The shapefile .prj is the only statement of the file's own CRS; Geomark never reports it."""
        if is_single_file or not file_path or not file_path.endswith('.shpz'):
            return None

        try:
            with zipfile.ZipFile(file_path) as archive:
                prj_names = [n for n in archive.namelist() if n.lower().endswith('.prj')]
                if not prj_names:
                    return None
                wkt = archive.read(prj_names[0]).decode('utf-8', errors='ignore')
        except Exception as e:
            current_app.logger.warning(f'Unable to read .prj from spatial bundle: {e}')
            return None

        return cls._parse_prj_wkt(wkt)

    @classmethod
    def _parse_prj_wkt(cls, wkt):
        name_match = re.search(r'(?:PROJCS|GEOGCS)\s*\[\s*"([^"]+)"', wkt or '', re.I)
        if not name_match:
            return None

        name = name_match.group(1).strip()
        # The outermost AUTHORITY closes the WKT, so the last code identifies the CRS itself.
        epsg_codes = re.findall(r'AUTHORITY\s*\[\s*"EPSG"\s*,\s*"?(\d+)"?\s*\]', wkt, re.I)
        return f'{name} (EPSG:{epsg_codes[-1]})' if epsg_codes else name

    @classmethod
    def _user_facing_error(cls, error_text, checks):
        """Geomark errors are raw geometry dumps; state what is wrong and what is required."""
        if checks.get('in_bc') is False:
            return 'Spatial file must be located within the Province of British Columbia.'

        if checks.get('bc_albers') is False:
            expected = checks.get('expected_projection') or BC_ALBERS_PROJECTION
            found = checks.get('found_projection')
            declared = checks.get('declared_projection')

            if found and declared and cls._names_projection(declared, expected):
                detail = (f'The .prj file declares {declared}, but the coordinates are outside the '
                          f'valid area for it and appear to be in {found}.')
            elif declared:
                detail = f'The .prj file declares {declared}.'
            elif found:
                detail = f'The coordinates appear to be in {found}.'
            else:
                detail = f'The coordinates are outside the valid area for {expected}.'

            return (f'Spatial file must be in the {expected} projection. {detail} '
                    f'Re-project the file to {expected} and upload it again.')

        return (error_text or 'Geomark validation failed')[:1000]

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
    def _attach_bundle(cls, result, bundle_documents, set_upload_completed=False):
        bundle = cls._new_bundle(result['name'], error=result.get('validation_error'))
        if result.get('geomark_id'):
            bundle.geomark_id = result['geomark_id']
        cls._link_documents(bundle, bundle_documents, set_upload_completed=set_upload_completed)
        result['docman_bundle_guid'] = str(bundle.bundle_guid)
        return result

    @classmethod
    def _result_from_existing_bundle(cls, bundle, documents):
        """Rebuild a Core-sync payload without calling Geomark again."""
        document_guids = [str(d.document_guid) for d in documents]
        if bundle.geomark_id:
            status = VALIDATION_STATUS_VALID
        elif bundle.error and str(bundle.error).startswith('Missing required'):
            status = VALIDATION_STATUS_UNABLE_TO_VALIDATE
        elif bundle.error:
            status = VALIDATION_STATUS_INVALID
        else:
            status = VALIDATION_STATUS_UNABLE_TO_VALIDATE
        return cls._result_dict(
            bundle.name,
            document_guids,
            status,
            bundle.error,
            None,
            geomark_id=bundle.geomark_id,
            docman_bundle_guid=str(bundle.bundle_guid),
        )

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

        checks = cls._empty_checks(
            missing_extensions=analysis['missing_extensions'],
            expected_projection=cls._expected_projection(analysis),
        )

        if not analysis['complete']:
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_UNABLE_TO_VALIDATE,
                f"Missing required file types: {', '.join(analysis['missing_extensions'])}",
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
            checks['declared_projection'] = cls._read_declared_projection(
                file_path, analysis['is_single_file'])
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
            mapped = cls._map_geomark_error(
                error_text, expected_projection=checks.get('expected_projection'))
            checks.update({k: v for k, v in mapped.items() if v is not None or k == 'found_projection'})
            result = cls._result_dict(
                bundle_name,
                document_guids,
                VALIDATION_STATUS_INVALID,
                cls._user_facing_error(error_text, checks)[:1000],
                checks,
            )
        elif geomark_response.get('id'):
            geomark_id = geomark_response.get('id')
            checks['in_bc'] = True
            # True means the file matched the CRS Geomark was asked to validate, not always Albers.
            checks['bc_albers'] = True
            checks['file_size_gt_0'] = True
            metadata = GeomarkHelper().fetch_geomark_metadata(geomark_id)
            if metadata:
                checks.update({
                    key: metadata[key]
                    for key in GEOMARK_METADATA_KEYS
                    if metadata.get(key) is not None
                })
            if metadata and metadata.get('is_valid') is False:
                geometry_error = metadata.get('geometry_validation_error') or 'Geometry is not valid'
                result = cls._result_dict(
                    bundle_name,
                    document_guids,
                    VALIDATION_STATUS_INVALID,
                    geometry_error[:1000],
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
            if all(getattr(d, 'document_bundle_guid', None) for d in group):
                bundle_guids = {str(d.document_bundle_guid) for d in group}
                bundle = getattr(group[0], 'document_bundle', None)
                if len(bundle_guids) == 1 and bundle:
                    current_app.logger.info(
                        f"Re-syncing already-bundled spatial group "
                        f"{[d.file_display_name for d in group]}"
                    )
                    results.append(cls._result_from_existing_bundle(bundle, group))
                    continue
            try:
                results.append(cls.process_document_group(group, blocking=blocking))
            except BadRequest as e:
                if blocking:
                    raise
                current_app.logger.warning(f'Spatial group failed (non-blocking): {e}')
        return results
