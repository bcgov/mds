from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class PermitConditionType(AuditMixin, Base):
    __tablename__ = 'permit_condition_type'
    condition_type_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def find_by_permit_condition_type(cls, _id):
        return cls.query.filter_by(condition_type_code=_id).first()

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()
