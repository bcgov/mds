from datetime import datetime

from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineTenureType(AuditMixin, Base):
    __tablename__ = 'mine_tenure_type'
    mine_tenure_type_id = db.Column(db.SmallInteger, nullable=False, primary_key=True)
    mine_tenure_type_name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<MineTenureType %r>' % self.mine_tenure_type_id

    @classmethod
    def all_options(cls):
        return list(map(
            lambda x: { 'value': x[0], 'label': x[1] },
            cls.query.with_entities(cls.mine_tenure_type_id, cls.mine_tenure_type_name).all()
        ))
