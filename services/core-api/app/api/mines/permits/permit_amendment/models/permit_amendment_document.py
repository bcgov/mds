from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from app.api.utils.models_mixins import AuditMixin, Base

from app.extensions import db
from app.api.constants import *


class PermitAmendmentDocument(AuditMixin, Base):
    __tablename__ = "permit_amendment_document"
    _edit_groups = [PERMIT_EDIT_GROUP, PERMIT_AMENDMENT_EDIT_GROUP]

    permit_amendment_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    permit_amendment_id = db.Column(
        db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'), nullable=True)
    document_name = db.Column(db.String, nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    permit_amendment = db.relationship(
        'PermitAmendment', backref='related_documents', lazy='joined')

    mine_name = association_proxy('permit_amendment', 'permit.mine.mine_name')

    @classmethod
    def find_by_permit_amendment_document_guid(cls, _guid):
        return cls.query.filter_by(permit_amendment_document_guid=_guid).first()