from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class MineDocumentBundle(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document_bundle'

    bundle_id = db.Column(db.Integer, primary_key=True)
    bundle_guid = db.Column(UUID(as_uuid=True), nullable=False)
    name = db.Column(db.String(300), nullable=False)
    geomark_id = db.Column(db.String(300), nullable=True)
    docman_bundle_guid = db.Column(UUID(as_uuid=True))

    # bundle_documents = db.relationship('MineDocument', back_populates='mine_document_bundle')

    def json(self):
        return {
            'bundle_id': str(self.bundle_id),
            'bundle_guid': str(self.bundle_guid),
            'name': self.name,
            'geomark_id': self.geomark_id,
            'docman_bundle_guid': str(self.docman_bundle_guid)
        }
