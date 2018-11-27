from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class DocumentManager(AuditMixin, Base):
    __tablename__ = 'document_manager'
    document_manager_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    document_guid = db.Column(UUID(as_uuid=True), nullable=False)
    full_storage_path = db.Column(db.String(100), nullable=True)
    upload_date = db.Column(db.DateTime, nullable=False)
    file_display_name = db.Column(db.String(40), nullable=False)
    path_display_name = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return '<Document_manager %r>' % self.party_guid

    def json(self):
        return {
            'document_manager_id' : str(self.document_manager_id),
            'document_guid' : str(self.document_guid),
            'full_storage_path' : str(self.full_storage_path),
            'upload_date' : str(self.upload_date),
            'file_display_name' : str(self.file_display_name),
            'path_display_name' : str(self.path_display_name)
        }