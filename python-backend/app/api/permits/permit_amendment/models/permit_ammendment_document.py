from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import Base

from app.extensions import db


class PermitAmendmentDocument(AuditMixin, Base):
    __tablename__ = "permit_ammendment_document_xref"
    permit_amendment_document_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    permit_amendment_id = db.Column(db.Integer,
                                    db.ForeignKey('permit_amendment.permit_amendment_id'))
    document_name = db.Column(db.String, nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    permit_amendment = db.relationship('PermitAmendment', backref='documents', lazy='joined')

    def json(self):
        return {
            'document_name':self.document_name
            'document_manager_guid':str(self.document_manager_guid) if self.document_manager_guid else None
        }