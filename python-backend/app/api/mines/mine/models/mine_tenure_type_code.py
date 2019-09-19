from datetime import datetime

from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineTenureTypeCode(AuditMixin, Base):
    __tablename__ = 'mine_tenure_type_code'
    mine_tenure_type_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<MineTenureTypeCode %r>' % self.mine_tenure_type_code

    @classmethod
    def find_all_active(cls):
        return cls.query.all()

    @classmethod
    def find_by_code(cls, code):
        return cls.query.find(code)
