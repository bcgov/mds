from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class PermitConditionStatusCode(AuditMixin, Base):
    __tablename__ = 'permit_condition_status_code'
    permit_condition_status_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def find_by_permit_condition_status_code(cls, _id):
        return cls.query.filter_by(permit_condition_status_code=_id).first()

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @validates('permit_condition_status_code')
    def validate_permit_condition_status_code(self, key, permit_condition_status_code):
        if not permit_condition_status_code:
            raise AssertionError('Permit condition status code is missing from request.')
        if len(permit_condition_status_code) > 3:
            raise AssertionError('Permit condition status code must not exceed 3 characters.')
        return permit_condition_status_code
