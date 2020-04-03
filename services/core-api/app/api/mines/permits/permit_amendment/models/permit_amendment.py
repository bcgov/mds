from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

from . import permit_amendment_status_code, permit_amendment_type_code
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.constants import *


class PermitAmendment(AuditMixin, Base):
    __tablename__ = 'permit_amendment'
    _edit_groups = [PERMIT_EDIT_GROUP, PERMIT_AMENDMENT_EDIT_GROUP]
    _edit_key = PERMIT_AMENDMENT_EDIT_GROUP

    permit_amendment_id = db.Column(db.Integer, primary_key=True)
    permit_amendment_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'), nullable=False)
    received_date = db.Column(db.DateTime, nullable=False)
    issue_date = db.Column(db.DateTime, nullable=False)
    authorization_end_date = db.Column(db.DateTime, nullable=False)
    permit_amendment_status_code = db.Column(
        db.String(3), db.ForeignKey('permit_amendment_status_code.permit_amendment_status_code'))
    permit_amendment_type_code = db.Column(
        db.String(3), db.ForeignKey('permit_amendment_type_code.permit_amendment_type_code'))
    description = db.Column(db.String, nullable=True)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    permit_amendment_status = db.relationship('PermitAmendmentStatusCode')
    permit_amendment_status_description = association_proxy('permit_amendment_status',
                                                            'description')
    permit_guid = association_proxy('permit', 'permit_guid')
    mine_guid = association_proxy('permit', 'mine_guid')
    permit_amendment_type = db.relationship('PermitAmendmentTypeCode')
    permit_amendment_type_description = association_proxy('permit_amendment_type', 'description')

    security_total = db.Column(db.Numeric(16, 2))
    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'))
    now_identity = db.relationship('NOWApplicationIdentity', lazy='select')

    @classmethod
    def create(cls,
               permit,
               received_date,
               issue_date,
               authorization_end_date,
               permit_amendment_type_code,
               description=None,
               permit_amendment_status_code='ACT',
               add_to_session=True):
        new_pa = cls(
            permit_id=permit.permit_id,
            received_date=received_date,
            issue_date=issue_date,
            authorization_end_date=authorization_end_date,
            permit_amendment_type_code=permit_amendment_type_code,
            permit_amendment_status_code=permit_amendment_status_code,
            description=description)
        permit.permit_amendments.append(new_pa)
        if add_to_session:
            new_pa.save(commit=False)
        return new_pa

    @classmethod
    def find_by_permit_amendment_id(cls, _id):
        return cls.query.filter_by(permit_amendment_id=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_permit_amendment_guid(cls, _guid):
        return cls.query.filter_by(permit_amendment_guid=_guid).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_permit_id(cls, _id):
        return cls.query.filter_by(permit_id=_id).filter_by(deleted_ind=False).all()

    @validates('permit_amendment_status_code')
    def validate_status_code(self, key, permit_amendment_status_code):
        if not permit_amendment_status_code:
            raise AssertionError('Permit amendment status code is not provided.')
        return permit_amendment_status_code

    @validates('permit_amendment_type_code')
    def validate_type_code(self, key, permit_amendment_type_code):
        if not permit_amendment_type_code:
            raise AssertionError('Permit amendment type code is not provided.')
        return permit_amendment_type_code

    @validates('received_date')
    def validate_received_date(self, key, received_date):
        if received_date:
            if received_date.isoformat() == '9999-12-31':
                raise AssertionError(
                    'Permit amendment received date should be set to null if not known.')
            if received_date > datetime.today():
                raise AssertionError('Permit amendment received date cannot be set to the future.')
        return received_date

    @validates('issue_date')
    def validate_issue_date(self, key, issue_date):
        if self.permit_amendment_type_code != 'OGP':
            original_permit_amendment = self.query.filter_by(permit_id=self.permit_id).filter_by(
                permit_amendment_type_code='OGP').first()
            if original_permit_amendment and original_permit_amendment.issue_date:
                if original_permit_amendment.issue_date > issue_date.date():
                    raise AssertionError(
                        'Permit amendment issue date cannot be before the permits First Issued date.'
                    )
        if issue_date:
            if issue_date.isoformat() == '9999-12-31':
                raise AssertionError(
                    'Permit amendment issue date should be set to null if not known.')
            if issue_date > datetime.today():
                raise AssertionError('Permit amendment issue date cannot be set to the future.')
        return issue_date

    @validates('authorization_end_date')
    def validate_authorization_end_date(self, key, authorization_end_date):
        if authorization_end_date and authorization_end_date.isoformat() == '9999-12-31':
            raise AssertionError('Permit amendment end date should be set to null if not known.')
        return authorization_end_date

    @validates('description')
    def validate_description(self, key, description):
        if description and len(description) > 280:
            raise AssertionError('Permit amendment description must be 280 characters or fewer.')
        return description