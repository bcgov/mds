from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, Base


class MinespaceUserDocumentXref(SoftDeleteMixin, Base):
    __tablename__ = 'minespace_user_document_xref'

    minespace_user_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    minespace_user_id = db.Column(
        db.Integer, db.ForeignKey('minespace_user.user_id'), nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.Date, nullable=False, server_default=FetchedValue())

    @classmethod
    def find_by_user_id(cls, user_id):
        return cls.query.filter_by(minespace_user_id=user_id).filter_by(deleted_ind=False).all()

    @classmethod
    def find_by_document_manager_guid(cls, document_manager_guid):
        return cls.query.filter_by(document_manager_guid=document_manager_guid).filter_by(
            deleted_ind=False).first()
