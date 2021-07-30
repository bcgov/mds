from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.list_lettering_helpers import num_to_letter, num_to_roman


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
    all_sub_conditions = db.relationship(
        'StandardPermitConditions',
        lazy='joined',
        order_by='asc(StandardPermitConditions.display_order)',
        backref=backref('parent', remote_side=[standard_permit_condition_id]))

    def __repr__(self):
        return '<StandardPermitConditions %r, %r>' % (self.standard_permit_condition_id,
                                                      self.standard_permit_condition_guid)

    def __str__(self):
        return f'<StandardPermitConditions> standard_permit_condition_id: {self.standard_permit_condition_id}, standard_permit_condition_guid: {self.standard_permit_condition_guid}, condition: {self.condition}, condition_category_code: {self.condition_category_code}, condition_type_code: {self.condition_type_code}, notice_of_work_type: {self.notice_of_work_type}, parent_standard_permit_condition_id: {self.parent_standard_permit_condition_id}, display_order: {self.display_order}, all_sub_conditions: {self.all_sub_conditions}'

    @hybrid_property
    def sub_conditions(self):
        return [x for x in self.all_sub_conditions if x.deleted_ind == False]


    @hybrid_property
    def step(self):
        depth = 0
        condition = self
        while condition.parent_standard_permit_condition_id is not None:
            condition = condition.parent
            depth += 1
        step_format = depth % 3
        if step_format == 0:
            return str(self.display_order) + '.'
        elif step_format == 1:
            return num_to_letter(self.display_order) + '.'
        elif step_format == 2:
            return num_to_roman(self.display_order) + '.'

    @classmethod
    def find_by_notice_of_work_type_code(cls, notice_of_work_type):
        condition_code = notice_of_work_type
        if notice_of_work_type == "QIM":
            condition_code = "QCA"
        elif notice_of_work_type == "COL":
            condition_code = "MIN"
        return cls.query.filter_by(
            notice_of_work_type=condition_code,
            parent_standard_permit_condition_id=None,
            deleted_ind=False).order_by(cls.display_order).all()

    @classmethod
    def find_by_standard_permit_condition_guid(cls, standard_permit_condition_guid):
        return cls.query.filter_by(
            standard_permit_condition_guid=standard_permit_condition_guid, deleted_ind=False).first()


    @classmethod
    def find_by_standard_permit_condition_id(cls, standard_permit_condition_id):
        return cls.query.filter_by(
            standard_permit_condition_id=standard_permit_condition_id, deleted_ind=False).first()
    
