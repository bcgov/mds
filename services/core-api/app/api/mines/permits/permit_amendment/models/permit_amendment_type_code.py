from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class PermitAmendmentTypeCode(AuditMixin, Base):
    __tablename__ = 'permit_amendment_type_code'
    permit_amendment_type_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def find_by_permit_amendment_type_code(cls, _id):
        return cls.query.filter_by(permit_amendment_type_code=_id).first()

    @classmethod
    def create_mine_permit_amendment_type_code(cls,
                                               code,
                                               description,
                                               display_order,
                                               active_ind,
                                               add_to_session=True):
        permit_amendment_type_code = cls(permit_amendment_type_code=code,
                                         description=description,
                                         display_order=display_order,
                                         active_ind=active_ind)
        if add_to_session:
            permit_amendment_type_code.save(commit=False)
        return permit_amendment_type_code

    @validates('permit_amendment_type_code')
    def validate_permit_amendment_type_code(self, key, permit_amendment_type_code):
        if not permit_amendment_type_code:
            raise AssertionError('Permit amendment type code is not provided.')
        if len(permit_amendment_type_code) > 3:
            raise AssertionError('Permit amendment type code must not exceed 3 characters.')
        return permit_amendment_type_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Permit amendment type description is not provided.')
        if len(description) > 100:
            raise AssertionError(
                'Permit amendment type description must not exceed 100 characters.')
        return description
