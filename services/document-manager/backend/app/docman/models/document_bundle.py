import uuid
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.utils.models_mixins import AuditMixin, Base


class DocumentBundle(AuditMixin, Base):
    __tablename__ = 'document_bundle'

    bundle_guid = db.Column(UUID(as_uuid=True), nullable=False, unique=True, primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(300), nullable=False)
    geomark_id = db.Column(db.String(300), nullable=True)
    error = db.Column(db.String(1000), nullable=True)

    documents = db.relationship('Document', back_populates='document_bundle', lazy='selectin')

    def __repr__(self):
        return f'<DocumentBundle {self.bundle_guid}>'

    def json(self):
        return {
            'bundle_guid': str(self.bundle_guid),
            'create_user': self.create_user,
            'create_timestamp': str(self.create_timestamp),
            'update_user': self.update_user,
            'update_timestamp': str(self.update_timestamp),
            'name': self.name,
            'geomark_id': self.geomark_id,
            'error': self.error
        }
