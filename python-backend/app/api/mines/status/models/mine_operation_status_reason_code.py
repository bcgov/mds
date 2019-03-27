from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class MineOperationStatusReasonCode(AuditMixin, Base):
    __tablename__ = 'mine_operation_status_reason_code'
    mine_operation_status_reason_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MineOperationStatusReasonCode %r>' % self.mine_operation_status_reason_code

    def json(self):
        return {
            'mine_operation_status_reason_code': self.mine_operation_status_reason_code,
            'description': self.description,
            'display_order': str(self.display_order),
        }

    @classmethod
    def find_by_mine_operation_status_reason_code(cls, _id):
        return cls.query.filter_by(mine_operation_status_reason_code=_id).first()

    @classmethod
    def create(cls, code, description, display_order, save=True):
        mine_operation_status_reason_code = cls(
            mine_operation_status_reason_code=code,
            description=description,
            display_order=display_order)
        if save:
            mine_operation_status_reason_code.save(commit=False)
        return mine_operation_status_reason_code

    @validates('mine_operation_status_reason_code')
    def validate_mine_operation_status_reason_code(self, key, mine_operation_status_reason_code):
        if not mine_operation_status_reason_code:
            raise AssertionError('Mine operation status reason code is not provided.')
        if len(mine_operation_status_reason_code) > 3:
            raise AssertionError('Mine operation status reason code must not exceed 3 characters.')
        return mine_operation_status_reason_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Mine operation status reason code description is not provided.')
        if len(description) > 100:
            raise AssertionError(
                'Mine operation status reason code description must not exceed 100 characters.')
        return description
