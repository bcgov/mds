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
    def all_options(cls):
        return list(map(
            lambda x: { 'value': x[0], 'label': x[1] },
            cls.query.with_entities(cls.mine_tenure_type_code, cls.description).all()
        ))
