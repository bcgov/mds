from sqlalchemy import text
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class MineDocumentBundle(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document_bundle'

    bundle_id = db.Column(db.Integer, primary_key=True)
    bundle_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=text("gen_random_uuid()"))
    name = db.Column(db.String(300), nullable=False)
    geomark_id = db.Column(db.String(300), nullable=True)
    docman_bundle_guid = db.Column(UUID(as_uuid=True))

    bundle_documents = db.relationship('MineDocument', back_populates='mine_document_bundle')

    def json(self):
        return {
            'bundle_id': str(self.bundle_id),
            'bundle_guid': str(self.bundle_guid),
            'name': self.name,
            'geomark_id': self.geomark_id,
            'docman_bundle_guid': str(self.docman_bundle_guid)
        }

    @classmethod
    def find_by_bundle_id(cls, bundle_id):
        return cls.query.filter_by(bundle_id=bundle_id).first()

    @classmethod
    def find_by_docman_bundle_guid(cls, docman_bundle_guid):
        return cls.query.filter_by(docman_bundle_guid=docman_bundle_guid).first()

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
                        name=doc.get('document_name'))
                    mine_doc_bundle.save()
                    spatial_bundles_guids.add(docman_bundle_guid)

                    # Assign the mine_document_bundle_id to all matching documents in the documents list
                    for doc in spatial_docs_copy:
                        if doc.get('docman_bundle_guid') == docman_bundle_guid:
                            doc['mine_document_bundle_id'] = mine_doc_bundle.bundle_id

        return spatial_docs_copy
