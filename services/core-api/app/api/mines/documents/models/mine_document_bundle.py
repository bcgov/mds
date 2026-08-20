from sqlalchemy import text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from werkzeug.exceptions import BadRequest

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.mines.documents.models.spatial_bundle_purpose_code import (
    MineDocumentBundlePurposeXref,
    SpatialBundlePurposeCode,
)

VALIDATION_STATUS_VALID = 'VALID'
VALIDATION_STATUS_INVALID = 'INVALID'
VALIDATION_STATUS_UNABLE_TO_VALIDATE = 'UNABLE_TO_VALIDATE'


class MineDocumentBundle(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document_bundle'

    bundle_id = db.Column(db.Integer, primary_key=True)
    bundle_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=text("gen_random_uuid()"))
    name = db.Column(db.String(300), nullable=False)
    geomark_id = db.Column(db.String(300), nullable=True)
    docman_bundle_guid = db.Column(UUID(as_uuid=True))
    validation_status = db.Column(db.String(30), nullable=True)
    validation_error = db.Column(db.String(1000), nullable=True)
    validation_checks = db.Column(JSONB, nullable=True)

    bundle_documents = db.relationship('MineDocument', back_populates='mine_document_bundle')
    purpose_xrefs = db.relationship(
        'MineDocumentBundlePurposeXref',
        lazy='joined',
        cascade='all, delete-orphan',
        primaryjoin='MineDocumentBundle.bundle_id == MineDocumentBundlePurposeXref.bundle_id')

    def json(self):
        return {
            'bundle_id': self.bundle_id,
            'bundle_guid': str(self.bundle_guid),
            'name': self.name,
            'geomark_id': self.geomark_id,
            'docman_bundle_guid': str(self.docman_bundle_guid) if self.docman_bundle_guid else None,
            'validation_status': self.validation_status,
            'validation_error': self.validation_error,
            'validation_checks': self.validation_checks,
            'purpose_codes': self.purpose_codes,
            'bundle_documents': [
                {
                    'mine_document_guid': str(doc.mine_document_guid),
                    'document_manager_guid': str(doc.document_manager_guid) if doc.document_manager_guid else None,
                    'document_name': doc.document_name,
                    'upload_date': str(doc.upload_date) if doc.upload_date else None,
                    'create_user': doc.create_user,
                } for doc in (self.bundle_documents or [])
            ],
        }

    @property
    def purpose_codes(self):
        return [xref.spatial_bundle_purpose_code for xref in (self.purpose_xrefs or [])]

    @classmethod
    def find_by_bundle_id(cls, bundle_id):
        return cls.query.filter_by(bundle_id=bundle_id).first()

    @classmethod
    def find_by_docman_bundle_guid(cls, docman_bundle_guid):
        return cls.query.filter_by(docman_bundle_guid=docman_bundle_guid).first()

    @classmethod
    def find_by_name_and_document_manager_guids(cls, name, document_manager_guids):
        """Find an existing bundle for reimport purpose preservation by name + linked docs."""
        from app.api.mines.documents.models.mine_document import MineDocument

        if not document_manager_guids:
            return None

        candidates = cls.query.filter_by(name=name, deleted_ind=False).all()
        guid_set = {str(g) for g in document_manager_guids}
        for candidate in candidates:
            linked = {
                str(d.document_manager_guid)
                for d in (candidate.bundle_documents or [])
                if d.document_manager_guid
            }
            if linked == guid_set:
                return candidate
        return None

    def set_purpose_codes(self, purpose_codes, sibling_bundle_ids=None):
        """Replace purpose assignments. Enforces is_exclusive_per_parent against siblings."""
        purpose_codes = list(dict.fromkeys(purpose_codes or []))
        sibling_bundle_ids = sibling_bundle_ids or []

        for code in purpose_codes:
            purpose = SpatialBundlePurposeCode.find_by_code(code)
            if not purpose or not purpose.active_ind:
                raise BadRequest(f'Invalid spatial bundle purpose code: {code}')
            if purpose.is_exclusive_per_parent and sibling_bundle_ids:
                conflict = MineDocumentBundlePurposeXref.query.filter(
                    MineDocumentBundlePurposeXref.spatial_bundle_purpose_code == code,
                    MineDocumentBundlePurposeXref.bundle_id.in_(sibling_bundle_ids),
                    MineDocumentBundlePurposeXref.bundle_id != self.bundle_id,
                ).first()
                if conflict:
                    raise BadRequest(
                        f'Purpose {code} may only be assigned to one spatial bundle on this record')

        MineDocumentBundlePurposeXref.query.filter_by(bundle_id=self.bundle_id).delete()
        for code in purpose_codes:
            db.session.add(
                MineDocumentBundlePurposeXref(
                    bundle_id=self.bundle_id, spatial_bundle_purpose_code=code))
        db.session.flush()

    @classmethod
    def upsert_from_spatial_result(cls,
                                   name,
                                   docman_bundle_guid,
                                   document_manager_guids,
                                   geomark_id=None,
                                   validation_status=None,
                                   validation_error=None,
                                   validation_checks=None,
                                   preserve_purposes=True):
        """Create or update a Core bundle and link MineDocuments by document_manager_guid."""
        from app.api.mines.documents.models.mine_document import MineDocument

        existing = None
        if docman_bundle_guid:
            existing = cls.find_by_docman_bundle_guid(docman_bundle_guid)
        if not existing:
            existing = cls.find_by_name_and_document_manager_guids(name, document_manager_guids)

        preserved_purposes = existing.purpose_codes if (existing and preserve_purposes) else []

        if existing:
            bundle = existing
            bundle.name = name
            bundle.geomark_id = geomark_id
            if docman_bundle_guid:
                bundle.docman_bundle_guid = docman_bundle_guid
            bundle.validation_status = validation_status
            bundle.validation_error = validation_error
            bundle.validation_checks = validation_checks
        else:
            bundle = cls(
                name=name,
                geomark_id=geomark_id,
                docman_bundle_guid=docman_bundle_guid,
                validation_status=validation_status,
                validation_error=validation_error,
                validation_checks=validation_checks,
            )
            db.session.add(bundle)
            db.session.flush()

        if document_manager_guids:
            docs = MineDocument.query.filter(
                MineDocument.document_manager_guid.in_(document_manager_guids)).all()
            for doc in docs:
                doc.mine_document_bundle_id = bundle.bundle_id

        if preserved_purposes:
            bundle.set_purpose_codes(preserved_purposes)

        db.session.commit()
        return bundle

    @staticmethod
    def parse_and_update_spatial_documents(documents):
        spatial_docs = [doc for doc in documents if doc.get('docman_bundle_guid') is not None]
        updated_spatial_docs = MineDocumentBundle.update_spatial_mine_document_with_bundle_id(spatial_docs)

        all_documents = [doc for doc in documents if doc.get('docman_bundle_guid') is None]
        all_documents.extend(updated_spatial_docs)
        return all_documents

    @staticmethod
    def update_spatial_mine_document_with_bundle_id(spatial_docs):
        spatial_docs_copy = spatial_docs.copy()
        spatial_bundles_guids = set()

        # Create a mine_document_bundle for each unique docman_bundle_guid attached to the spatial documents
        for doc in spatial_docs_copy:
            docman_bundle_guid = doc.get('docman_bundle_guid')
            if docman_bundle_guid is not None:
                mine_doc_bundle = MineDocumentBundle.find_by_docman_bundle_guid(docman_bundle_guid)

                if docman_bundle_guid not in spatial_bundles_guids and mine_doc_bundle is None:
                    mine_doc_bundle = MineDocumentBundle(
                        geomark_id=doc.get('geomark_id'),
                        docman_bundle_guid=docman_bundle_guid,
                        name=doc.get('document_name'),
                        validation_status=doc.get('validation_status'),
                        validation_error=doc.get('validation_error'),
                        validation_checks=doc.get('validation_checks'),
                    )
                    mine_doc_bundle.save()
                    spatial_bundles_guids.add(docman_bundle_guid)

                    # Assign the mine_document_bundle_id to all matching documents in the documents list
                    for spatial_doc in spatial_docs_copy:
                        if spatial_doc.get('docman_bundle_guid') == docman_bundle_guid:
                            spatial_doc['mine_document_bundle_id'] = mine_doc_bundle.bundle_id
                elif mine_doc_bundle is not None:
                    # Refresh validation fields if provided on subsequent uploads
                    if doc.get('validation_status'):
                        mine_doc_bundle.validation_status = doc.get('validation_status')
                        mine_doc_bundle.validation_error = doc.get('validation_error')
                        mine_doc_bundle.validation_checks = doc.get('validation_checks')
                        if doc.get('geomark_id'):
                            mine_doc_bundle.geomark_id = doc.get('geomark_id')
                        mine_doc_bundle.save()
                    for spatial_doc in spatial_docs_copy:
                        if spatial_doc.get('docman_bundle_guid') == docman_bundle_guid:
                            spatial_doc['mine_document_bundle_id'] = mine_doc_bundle.bundle_id

        return spatial_docs_copy
