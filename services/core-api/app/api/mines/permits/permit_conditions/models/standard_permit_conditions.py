from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates, backref
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class StandardPermitConditions(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'standard_permit_conditions'

    standard_permit_condition_id = db.Column(db.Integer, primary_key=True)
    standard_permit_condition_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    condition = db.Column(db.String, nullable=False)
    condition_category_code = db.Column(
        db.String,
        db.ForeignKey('permit_condition_category.condition_category_code'),
        nullable=False)
    condition_type_code = db.Column(
        db.String, db.ForeignKey('permit_condition_type.condition_type_code'), nullable=False)
    notice_of_work_type = db.Column(
        db.String, db.ForeignKey('notice_of_work_type.notice_of_work_type_code'), nullable=False)
    parent_standard_permit_condition_id = db.Column(
        db.Integer, db.ForeignKey('standard_permit_conditions.standard_permit_condition_id'))
    display_order = db.Column(db.Integer, nullable=False)
    sub_conditions = db.relationship(
        'StandardPermitConditions',
        lazy='joined',
        backref=backref('parent', remote_side=[standard_permit_condition_id]))

    @classmethod
    def find_by_notice_of_work_type_code(cls, notice_of_work_type):
        return cls.query.filter_by(
            notice_of_work_type=notice_of_work_type,
            parent_standard_permit_condition_id=None,
            deleted_ind=False).order_by(cls.display_order).all()

    def __repr__(self):
        return '<StandardPermitConditions %r, %r>' % (self.standard_permit_condition_id,
                                                      self.standard_permit_condition_guid)
