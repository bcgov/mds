import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

from app.utils.models_mixins import Base


class DocumentVersion(Base):
    __tablename__ = 'document_version'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('document.document_guid'), nullable=False)
    created_by = db.Column(db.String(60), nullable=False)
    created_date = db.Column(db.DateTime, nullable=False)
    upload_completed_date = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)
    object_store_version_id = db.Column(db.Integer, nullable=False)
    file_display_name = db.Column(db.String(40), nullable=False)

    def __repr__(self):
        return '<DocumentVersion %r>' % self.id

    def json(self):
        return {
            'id': str(self.id),
            'document_guid': str(self.document_guid),
            'created_by': self.created_by,
            'created_date': str(self.created_date),
            'upload_completed_date': str(self.upload_completed_date) if self.upload_completed_date else None,
            'object_store_version_id': self.object_store_version_id,
            'file_display_name': self.file_display_name
        }

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(id=id).first()

    @classmethod
    def find_by_document_guid(cls, document_guid):
        return cls.query.filter_by(document_guid=document_guid).all()