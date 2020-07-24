from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.api.utils.field_template import FieldTemplate
from app.api.utils.models_mixins import AuditMixin, Base


class PermitConditions(AuditMixin, Base):
    __tablename__ = 'permit_conditions'

    class _ModelSchema(Base._ModelSchema):
        permit_condition_id = fields.Integer(dump_only=True)
        permit_condition_guid = fields.UUID(dump_only=True)
        condition_category = FieldTemplate(field=fields.String, one_of='BondType')

    permit_condition_id = db.Column(db.Integer, primary_key=True)
    permit_amendment_id = db.Column(
        db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'), nullable=False)
    permit_condition_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    condition = db.Column(db.String, nullable=False)
    condition_category = db.Column(
        db.String,
        db.ForeignKey('permit_condition_category.condition_category_code'),
        nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    parent_condition_id = db.Column(
        db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)

    sub_conditions = db.relationship('PermitConditions', lazy='joined')

    def __repr__(self):
        return '<PermitConditions %r, %r>' % (self.permit_condition_id, self.permit_condition_guid)