from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class MineOperationStatusCode(AuditMixin, Base):
    __tablename__ = 'mine_operation_status_code'
    mine_operation_status_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineOperationStatusCode %r>' % self.mine_operation_status_code

    def json(self):
        return {
            'mine_operation_status_code': self.mine_operation_status_code,
            'description': self.description,
            'display_order': str(self.display_order),
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_operation_status_code(cls, _id):
        return cls.query.filter_by(mine_operation_status_code=_id).first()

    @classmethod
    def create_mine_operation_status_code(cls, code, description, display_order, user_kwargs, save=True):
        mine_operation_status_code = cls(
            mine_operation_status_code=code,
            description=description,
            display_order=display_order,
            **user_kwargs
        )
        if save:
            mine_operation_status_code.save(commit=False)
        return mine_operation_status_code

    @validates('mine_operation_status_code')
    def validate_mine_operation_status_code(self, key, mine_operation_status_code):
        if not mine_operation_status_code:
            raise AssertionError('Mine operation status code is not provided.')
        if len(mine_operation_status_code) > 3:
            raise AssertionError('Mine operation status code must not exceed 3 characters.')
        return mine_operation_status_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Mine operation status code description is not provided.')
        if len(description) > 100:
            raise AssertionError('Mine operation status code description must not exceed 100 characters.')
        return description
