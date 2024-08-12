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
