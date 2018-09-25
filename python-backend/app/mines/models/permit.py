from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from .mixins import AuditMixin, Base


class Permit(AuditMixin, Base):
    __tablename__ = 'permit'
    permit_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    permit_no = db.Column(db.String(16), nullable=False)
    received_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    approved_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    status_code = db.Column(db.String(1), db.ForeignKey('permit_status_code.permit_status_code'))

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    def json(self):
        return {
            'permit_guid': str(self.permit_guid),
            'mine_guid': str(self.mine_guid),
            'permit_no': self.permit_no,
            'status_code': self.status_code,
            'received_date': self.received_date.isoformat(),
            'approved_date': self.approved_date.isoformat()
        }

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

    @validates('status_code')
    def validate_status_code(self, key, status_code):
        if not status_code:
            raise AssertionError('Status code is not provided.')
        return status_code

    @validates('permit_no')
    def validate_permit_no(self, key, permit_no):
        if not permit_no:
            raise AssertionError('Permit number is not provided.')
        if len(permit_no) > 16:
            raise AssertionError('Permit number must not exceed 16 characters.')
        return permit_no

    @validates('received_date')
    def validate_received_date(self, key, received_date):
        if received_date.isoformat() == '9999-12-31':
            return received_date
        if received_date > datetime.today():
            raise AssertionError('Permit received date cannot be set to the future.')
        return received_date

    @validates('approved_date')
    def validate_approved_date(self, key, approved_date):
        if approved_date.isoformat() == '9999-12-31':
            return approved_date
        if approved_date > datetime.today():
            raise AssertionError('Permit approved date cannot be set to the future.')
        return approved_date


class PermitStatusCode(AuditMixin, Base):
    __tablename__ = 'permit_status_code'
    permit_status_code = db.Column(db.String(3), nullable=False, primary_key=True)
    permit_status_code_guid = db.Column(UUID(as_uuid=True))
    permit_status_description = db.Column(db.String(60), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    def json(self):
        return {
            'status_code': self.status_code,
            'status_code_guid': str(self.mine_guid),
            'status_name': self.permit_no,
            'status_description': self.status_code,
        }

    @classmethod
    def find_by_permit_status_code_guid(cls, _id):
        return cls.query.filter_by(permit_status_code_guid=_id).first()

    @classmethod
    def find_by_permit_status_code(cls, _id):
        return cls.query.filter_by(permit_status_code=_id).first()

    @validates('permit_status_code')
    def validate_permit_status_code(self, key, permit_status_code):
        if not permit_status_code:
            raise AssertionError('Permit status code is not provided.')
        if len(permit_status_code) > 1:
            raise AssertionError('Permit number must not exceed 1 characters.')
        return permit_status_code

    @validates('permit_status_description')
    def validate_permit_status_description(self, key, permit_status_description):
        if not permit_status_description:
            raise AssertionError('Permit status description is not provided.')
        if len(permit_status_description) > 100:
            raise AssertionError('Permit status description must not exceed 100 characters.')
        return permit_status_description
