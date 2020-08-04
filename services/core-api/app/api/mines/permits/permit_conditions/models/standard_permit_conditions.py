from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class StandardPermitConditions(AuditMixin, Base):
    __tablename__ = 'standard_permit_conditions'

    standard_permit_condition_id = db.Column(db.Integer, primary_key=True)
    standard_permit_condition_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    condition = db.Column(db.String, nullable=False)
    condition_category = db.Column(
        db.String,
        db.ForeignKey('permit_condition_category.condition_category_code'),
        nullable=False)
    permit_type = db.Column(
        db.String, db.ForeignKey('notice_of_work_type.notice_of_work_type_code'), nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    parent_condition_id = db.Column(
        db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'), nullable=False)
    parent_standard_permit_condition_id = db.Column(db.Integer,
                                    db.ForeignKey('standard_permit_conditions.standard_permit_condition_id'))
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<StandardPermitConditions %r, %r>' % (self.standard_permit_condition_id,
                                                      self.standard_permit_condition_guid)
