import uuid
from datetime import datetime, timedelta

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api
from flask_restplus import fields

from app.api.utils.models_mixins import AuditMixin, Base

DOWNLOAD_TOKEN = api.model(
    'DownloadToken', {
        'download_token_guid': fields.String,
        'document_guid': fields.String,
        'redeemed_ind': fields.Boolean,
    })


class DownloadToken(AuditMixin, Base):
    __tablename__ = 'download_token'
    download_token_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('document_manager.document_guid'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    redeemed_ind = db.Column(db.Boolean, nullable=False, default=False)

    document = db.relationship('DocumentManager', uselist=False, lazy='joined')

    def __repr__(self):
        return '<DownloadToken %r>' % self.download_token_guid

    @classmethod
    def create_download_token(cls, document_guid, add_to_session=True):
        short_expiry = datetime.now() + timedelta(minutes=5)

        mine_type = cls(document_guid=document_guid, expires_at=short_expiry)
        if add_to_session:
            mine_type.save(commit=False)
        return mine_type

    @classmethod
    def find_by_download_token_guid(cls, download_token_guid):
        try:
            uuid.UUID(download_token_guid, version=4)
            return cls.query.filter_by(download_token_guid=download_token_guid).first()
        except ValueError:
            return None
