from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from . import permit_amendment_status_code, permit_amendment_type_code
from ....utils.models_mixins import AuditMixin, Base


class PermitAmendment(AuditMixin, Base):
    __tablename__ = 'permit_amendment'
    permit_amendment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    permit_amendment_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'), nullable=False)
    received_date = db.Column(db.DateTime, nullable=False)
    issue_date = db.Column(db.DateTime, nullable=False)
    authorization_end_date = db.Column(db.DateTime, nullable=False)
    permit_amendment_status_code = db.Column(
        db.String(2), db.ForeignKey('permit_amendment_status_code.permit_amendment_status_code'))
    permit_amendment_type_code = db.Column(
        db.String(2), db.ForeignKey('permit_amendment_type_code.permit_amendment_type_code'))

    mine_documents = db.relationship('PermitAmendmentDocumentXref', lazy='joined')

    def json(self):
        return {
            'permit_amendment_id':
            str(self.permit_amendment_id),
            'permit_amendment_guid':
            str(self.permit_amendment_guid),
            'permit_id':
            str(self.permit_id),
            'permit_amendment_status_code':
            self.permit_amendment_status_code,
            'permit_amendment_type_code':
            self.permit_amendment_type_code,
            'received_date':
            self.received_date.isoformat() if self.received_date else None,
            'issue_date':
            self.issue_date.isoformat() if self.issue_date else None,
            'authorization_end_date':
            self.authorization_end_date.isoformat() if self.authorization_end_date else None,
            'related_documents':
            str(self.mine_documents.mine_document_guid) if self.mine_documents else []
        }

    @classmethod
    def create(cls,
               permit,
               received_date,
               issue_date,
               authorization_end_date,
               user_kwargs,
               permit_amendment_type_code='AMD',
               permit_amendment_status_code='ACT',
               save=False):
        new = cls(
            permit_id=permit.permit_id,
            received_date=received_date,
            issue_date=issue_date,
            authorization_end_date=authorization_end_date,
            permit_amendment_type_code=permit_amendment_type_code,
            permit_amendment_status_code=permit_amendment_status_code,
            **user_kwargs)
        permit.permit_amendments.append(new)
        if save:
            db.session.commit()
        return new

    @classmethod
    def find_by_permit_amendment_id(cls, _id):
        return cls.query.filter_by(permit_amendment_id=_id).first()

    @classmethod
    def find_by_permit_id(cls, _id):
        return cls.query.filter_by(permit_id=_id)

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

    @validates('permit_id')
    def validate_permit_id(self, key, permit_id):
        if not permit_id:
            raise AssertionError('Permit id is not provided.')
        return permit_id

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
