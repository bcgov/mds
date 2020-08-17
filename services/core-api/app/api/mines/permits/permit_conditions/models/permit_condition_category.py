from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class PermitConditionCategory(AuditMixin, Base):
    __tablename__ = 'permit_condition_category'

    condition_category_code = db.Column(db.String, nullable=False, primary_key=True)
    step = db.Column(db.String)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<PermitConditionCategory %r>' % self.condition_category_code

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()