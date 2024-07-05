import uuid

from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db


from app.utils.models_mixins import AuditMixin, Base


class Document(AuditMixin, Base):
    __tablename__ = 'document'
    document_id = db.Column(db.Integer, primary_key=True)
    document_guid = db.Column(UUID(as_uuid=True), nullable=False, unique=True)
    document_bundle_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('document_bundle.bundle_guid'), nullable=True)
    document_bundle = db.relationship('DocumentBundle', back_populates='documents')
    full_storage_path = db.Column(db.String(4096), nullable=False)
    upload_started_date = db.Column(db.DateTime, nullable=False)
    upload_completed_date = db.Column(db.DateTime, nullable=True)
    file_display_name = db.Column(db.String(255), nullable=False)
    path_display_name = db.Column(db.String(4096), nullable=False)
    object_store_path = db.Column(db.String)
    status = db.Column(db.String(255), nullable=False, default='In Progress')
    
    # ID of multipart upload
    multipart_upload_id = db.Column(db.String(1024), nullable=True, default=None)
    multipart_upload_path = db.Column(db.String(4096), nullable=True, default=None)

    versions = db.relationship('DocumentVersion', backref='document', lazy='selectin')

    def __repr__(self):
        return '<Document %r>' % self.document_id

    def json(self):
        return {
            'document_guid': str(self.document_guid),
            'document_bundle_guid': str(self.document_bundle_guid),
            'full_storage_path': self.full_storage_path,
            'upload_started_date': str(self.upload_started_date),
            'upload_completed_date':
            str(self.upload_completed_date) if self.upload_completed_date else None,
            'file_display_name': self.file_display_name,
            'path_display_name': self.path_display_name,
            'object_store_path': self.object_store_path,
            'status': self.status
        }

    def task_json(self):
        return {
            'document_id': self.document_id,
            'document_guid': str(self.document_guid),
            'full_storage_path': self.full_storage_path,
            'object_store_path': self.object_store_path
        }

    @classmethod
    def find_by_document_guid(cls, document_guid):
        try:
            uuid.UUID(document_guid, version=4)
            return cls.query.filter_by(document_guid=document_guid).first()
        except ValueError:
            return None

    @classmethod
    def find_by_document_guid_many(cls, document_guids):
        return cls.query.filter(Document.document_guid.in_(document_guids)).all()
