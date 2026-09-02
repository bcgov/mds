from app.api.mines.documents.models.spatial_bundle_purpose_code import (
    MineDocumentBundlePurposeXref,
    SpatialBundlePurposeCode,
)
from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from werkzeug.exceptions import BadRequest

VALIDATION_STATUS_VALID = 'VALID'
VALIDATION_STATUS_INVALID = 'INVALID'
VALIDATION_STATUS_UNABLE_TO_VALIDATE = 'UNABLE_TO_VALIDATE'


class MineDocumentBundle(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document_bundle'

    bundle_id = db.Column(db.Integer, primary_key=True)
    bundle_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=text("gen_random_uuid()"))
    name = db.Column(db.String(300), nullable=False)
    geomark_id = db.Column(db.String(300), nullable=True)
    docman_bundle_guid = db.Column(UUID(as_uuid=True), nullable=False)
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
                if not getattr(doc, 'deleted_ind', False)
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

    def set_purpose_codes(self, purpose_codes):
        """Replace purpose assignments. An empty list clears all purposes; None is invalid."""
        if purpose_codes is None:
            raise BadRequest('purpose_codes is required')
        if not isinstance(purpose_codes, (list, tuple)):
            raise BadRequest('purpose_codes must be a list')
        purpose_codes = list(dict.fromkeys(purpose_codes))

        for code in purpose_codes:
            purpose = SpatialBundlePurposeCode.find_by_code(code)
            if not purpose or not purpose.active_ind:
                raise BadRequest(f'Invalid spatial bundle purpose code: {code}')

        # Mutate the relationship rather than issuing a bulk delete so the
        # delete-orphan cascade keeps the loaded collection in sync.
        existing = {xref.spatial_bundle_purpose_code: xref for xref in self.purpose_xrefs}
        for code, xref in existing.items():
            if code not in purpose_codes:
                self.purpose_xrefs.remove(xref)
        for code in purpose_codes:
            if code not in existing:
                self.purpose_xrefs.append(
                    MineDocumentBundlePurposeXref(spatial_bundle_purpose_code=code))
        db.session.flush()

    @classmethod
    def _find_bundle_for_spatial_result(cls, name, docman_bundle_guid, document_manager_guids):
        existing = cls.find_by_docman_bundle_guid(docman_bundle_guid) if docman_bundle_guid else None
        return existing or cls.find_by_name_and_document_manager_guids(
            name, document_manager_guids)

    @staticmethod
    def _mine_guids_of(documents):
        return {str(doc.mine_guid) for doc in documents if doc.mine_guid}

    @staticmethod
    def _fetch_documents_by_manager_guid(document_manager_guids):
        from app.api.mines.documents.models.mine_document import MineDocument

        docs = MineDocument.query.filter(
            MineDocument.document_manager_guid.in_(document_manager_guids)).all()
        found = {str(doc.document_manager_guid) for doc in docs}
        missing = [str(guid) for guid in document_manager_guids if str(guid) not in found]
        if missing:
            raise BadRequest(f'Unknown document_manager_guids: {", ".join(missing)}')
        return docs

    @classmethod
    def _assert_documents_share_one_mine(cls, docs, mine_guid):
        if mine_guid:
            expected = str(mine_guid)
            foreign = [
                str(doc.document_manager_guid) for doc in docs if str(doc.mine_guid) != expected
            ]
            if foreign:
                raise BadRequest('Mine document not attached to Mine')
        if len(cls._mine_guids_of(docs)) > 1:
            raise BadRequest('Spatial documents must belong to a single mine')

    def _assert_documents_match_bundle_mine(self, document_mine_guids, mine_guid):
        existing_mines = {
            str(doc.mine_guid)
            for doc in (self.bundle_documents or [])
            if doc.mine_guid and not getattr(doc, 'deleted_ind', False)
        }
        if not existing_mines:
            raise BadRequest('Cannot link documents onto a bundle with no active mine documents')
        if document_mine_guids and existing_mines != document_mine_guids:
            raise BadRequest('Cannot link documents from another mine onto this bundle')
        if mine_guid and existing_mines != {str(mine_guid)}:
            raise BadRequest('Cannot link documents from another mine onto this bundle')

    @classmethod
    def _resolve_documents_for_spatial_result(cls, document_manager_guids, mine_guid, existing):
        if not document_manager_guids:
            return []

        docs = cls._fetch_documents_by_manager_guid(document_manager_guids)
        cls._assert_documents_share_one_mine(docs, mine_guid)
        if existing:
            existing._assert_documents_match_bundle_mine(cls._mine_guids_of(docs), mine_guid)
        return docs

    def _apply_spatial_result(self, name, docman_bundle_guid, geomark_id, validation_status,
                              validation_error, validation_checks):
        self.name = name
        self.docman_bundle_guid = docman_bundle_guid
        self.geomark_id = geomark_id
        self.validation_status = validation_status
        self.validation_error = validation_error
        self.validation_checks = validation_checks

    @classmethod
    def upsert_from_spatial_result(cls,
                                   name,
                                   docman_bundle_guid,
                                   document_manager_guids,
                                   geomark_id=None,
                                   validation_status=None,
                                   validation_error=None,
                                   validation_checks=None,
                                   mine_guid=None):
        """Create or update a Core bundle and link MineDocuments by document_manager_guid."""
        existing = cls._find_bundle_for_spatial_result(name, docman_bundle_guid,
                                                       document_manager_guids)
        docs = cls._resolve_documents_for_spatial_result(document_manager_guids, mine_guid, existing)
        purpose_codes = existing.purpose_codes if existing else []

        if existing:
            bundle = existing
            bundle._apply_spatial_result(name, docman_bundle_guid, geomark_id, validation_status,
                                         validation_error, validation_checks)
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

        for doc in docs:
            doc.mine_document_bundle_id = bundle.bundle_id

        bundle.set_purpose_codes(purpose_codes)

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
                        mine_doc_bundle.geomark_id = doc.get('geomark_id')
                        mine_doc_bundle.save()
                    for spatial_doc in spatial_docs_copy:
                        if spatial_doc.get('docman_bundle_guid') == docman_bundle_guid:
                            spatial_doc['mine_document_bundle_id'] = mine_doc_bundle.bundle_id

        return spatial_docs_copy
