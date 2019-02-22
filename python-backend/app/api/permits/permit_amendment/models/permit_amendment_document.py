from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base

from app.extensions import db


class PermitAmendmentDocument(AuditMixin, Base):
    __tablename__ = "permit_amendment_document"
    permit_amendment_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    permit_amendment_id = db.Column(db.Integer,
                                    db.ForeignKey('permit_amendment.permit_amendment_id'))
    document_name = db.Column(db.String, nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    permit_amendment = db.relationship('PermitAmendment', backref='documents', lazy='joined')

    def json(self):
        return {
            'document_guid':
            str(self.permit_amendment_document_guid),
            'document_name':
            self.document_name,
            'document_manager_guid':
            str(self.document_manager_guid) if self.document_manager_guid else None
        }

    @classmethod
    def find_by_permit_amendment_guid(cls, _guid):
        return cls.query.filter_by(permit_amendment_document_guid=_guid).first()