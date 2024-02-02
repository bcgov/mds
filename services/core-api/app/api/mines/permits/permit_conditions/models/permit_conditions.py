from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates, backref
from app.extensions import db
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.field_template import FieldTemplate
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.list_lettering_helpers import num_to_letter, num_to_roman


class PermitConditions(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit_conditions'

    class _ModelSchema(Base._ModelSchema):
        permit_condition_id = fields.Integer(dump_only=True)
        permit_condition_guid = fields.UUID(dump_only=True)
        condition_category_code = FieldTemplate(
            field=fields.String, one_of='PermitConditionCategory')
        condition_type_code = FieldTemplate(field=fields.String, one_of='PermitConditionType')

    permit_condition_id = db.Column(db.Integer, primary_key=True)
    permit_amendment_id = db.Column(
        db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'), nullable=False)
    permit_amendment = db.relationship('PermitAmendment', lazy='select', back_populates='conditions')
    permit_condition_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    condition = db.Column(db.String, nullable=False)
    condition_category_code = db.Column(
        db.String,
        db.ForeignKey('permit_condition_category.condition_category_code'),
        nullable=False)
    condition_type_code = db.Column(
        db.String, db.ForeignKey('permit_condition_type.condition_type_code'), nullable=False)
    parent_permit_condition_id = db.Column(db.Integer,
                                           db.ForeignKey('permit_conditions.permit_condition_id'))
    display_order = db.Column(db.Integer, nullable=False)

    all_sub_conditions = db.relationship(
        'PermitConditions',
        lazy='joined',
        order_by='asc(PermitConditions.display_order)',
        backref=backref('parent', remote_side=[permit_condition_id]))

    @hybrid_property
    def sub_conditions(self):
        return [x for x in self.all_sub_conditions if x.deleted_ind == False]

    @hybrid_property
    def step(self):
        depth = 0
        condition = self
        while condition.parent_permit_condition_id is not None:
            condition = condition.parent
            depth += 1
        step_format = depth % 3
        if step_format == 0:
            return str(self.display_order) + '.'
        elif step_format == 1:
            return num_to_letter(self.display_order) + '.'
        elif step_format == 2:
            return num_to_roman(self.display_order) + '.'

    def __repr__(self):
        return '<PermitConditions %r, %r, %r>' % (self.permit_condition_id,
                                                  self.permit_condition_guid, self.display_order)

    @classmethod
    def create(cls,
               condition_category_code,
               condition_type_code,
               permit_amendment_id,
               condition,
               display_order,
               sub_conditions,
               parent=None):
        permit_condition = cls(
            condition_category_code=condition_category_code,
            condition_type_code=condition_type_code,
            permit_amendment_id=permit_amendment_id,
            condition=condition,
            display_order=display_order,
            parent=parent)

        permit_condition.save(commit=False)
        for condition in sub_conditions:
            PermitConditions.create(condition.condition_category_code,
                                    condition.condition_type_code, permit_amendment_id,
                                    condition.condition, condition.display_order,
                                    condition.sub_conditions, permit_condition)
        return permit_condition

    
    @classmethod
    def delete_all_by_permit_amendment_id(cls, permit_amendment_id, commit=False):
        parent_conditions = cls.query.filter_by(
            permit_amendment_id=permit_amendment_id,
            parent_permit_condition_id=None,
            deleted_ind=False).order_by(cls.display_order).all()
        for condition in parent_conditions:
            condition.delete_condition()
            if commit:
                condition.save()


    def delete_condition(self):
        if self.all_sub_conditions is not None:
            subconditions = [c for c in self.all_sub_conditions if c.deleted_ind == False]
            if len(subconditions) > 0:
                for item in subconditions:
                    item.deleted_ind = True
                    item.delete_condition()
        self.deleted_ind = True


    @classmethod
    def find_all_by_permit_amendment_id(cls, permit_amendment_id):
        return cls.query.filter_by(
            permit_amendment_id=permit_amendment_id,
            parent_permit_condition_id=None,
            deleted_ind=False).order_by(cls.display_order).all()

    @classmethod
    def find_by_permit_condition_guid(cls, permit_condition_guid):
        return cls.query.filter_by(
            permit_condition_guid=permit_condition_guid, deleted_ind=False).first()

    @classmethod
    def find_by_permit_condition_id(cls, permit_condition_id):
        return cls.query.filter_by(
            permit_condition_id=permit_condition_id, deleted_ind=False).first()
