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
    permit_status_code = db.Column(
        db.String(2), db.ForeignKey('permit_status_code.permit_status_code'))

    permit_amendments = db.relationship(
        'PermitAmendment',
        backref='permit',
        primaryjoin=
        "and_(PermitAmendment.permit_id == Permit.permit_id, PermitAmendment.deleted_ind==False)",
        order_by='desc(PermitAmendment.issue_date)',
        lazy='selectin')

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    def json(self):
        return {
            'permit_id': str(self.permit_id),
            'permit_guid': str(self.permit_guid),
            'mine_guid': str(self.mine_guid),
            'permit_no': self.permit_no,
            'permit_status_code': self.permit_status_code,
            'amendments': [x.json() for x in self.permit_amendments]
        }

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

    @classmethod
    def create(cls, mine_guid, permit_no, permit_status_code, user_kwargs, save=True):
        mine_permit = cls(
            mine_guid=mine_guid,
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