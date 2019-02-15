from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class Permit(AuditMixin, Base):
    __tablename__ = 'permit'
    permit_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    permit_guid = db.Column(UUID(as_uuid=True))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    permit_no = db.Column(db.String(16), nullable=False)
    #received_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    #issue_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    #authorization_end_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    permit_status_code = db.Column(
        db.String(2), db.ForeignKey('permit_status_code.permit_status_code'))

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    def json(self):
        return {
            'permit_guid': str(self.permit_guid),
            'mine_guid': str(self.mine_guid),
            'permit_no': self.permit_no,
            'permit_status_code': self.permit_status_code,
            #'received_date': self.received_date.isoformat(),
            #'issue_date': self.issue_date.isoformat(),
            #'authorization_end_date': self.authorization_end_date.isoformat()
        }

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

    @classmethod
    def create_mine_permit(cls, mine, permit_no, permit_status_code, user_kwargs, save=True):
        mine_permit = cls(
            permit_guid=uuid.uuid4(),
            mine_guid=mine.mine_guid,
            permit_no=permit_no,
            permit_status_code=permit_status_code,
            **user_kwargs)
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