from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class Permit(AuditMixin, Base):
    __tablename__ = 'permit'
    permit_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    permit_no = db.Column(db.String(16), nullable=False)
    received_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    issue_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    permit_status_code = db.Column(db.String(2), db.ForeignKey('permit_status_code.permit_status_code'))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    permittee = db.relationship('Permittee', backref='permittee', order_by='desc(Permittee.effective_date), desc(Permittee.update_timestamp)', lazy='joined')

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    def json(self):
        return {
            'permit_guid': str(self.permit_guid),
            'mine_guid': str(self.mine_guid),
            'permit_no': self.permit_no,
            'permit_status_code': self.permit_status_code,
            'received_date': self.received_date.isoformat(),
            'issue_date': self.issue_date.isoformat(),
            'expiry_date': self.issue_date.isoformat(),
            'permittee': [item.json() for item in self.permittee]
        }

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

    @classmethod
    def create_mine_permit(cls, mine_identity, permit_no, permit_status_code, issue_date, user_kwargs, save=True):
        mine_permit = cls(
            permit_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            permit_no=permit_no,
            permit_status_code=permit_status_code,
            issue_date=issue_date,
            **user_kwargs
        )
        if save:
            mine_permit.save(commit=False)
        return mine_permit

    @validates('permit_status_code')
    def validate_status_code(self, key, permit_status_code):
        if not permit_status_code:
            raise AssertionError('Permit status code is not provided.')
        return permit_status_code

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

    @validates('issue_date')
    def validate_issue_date(self, key, issue_date):
        if issue_date.isoformat() == '9999-12-31':
            return issue_date
        if issue_date > datetime.today():
            raise AssertionError('Permit issue date cannot be set to the future.')
        return issue_date
