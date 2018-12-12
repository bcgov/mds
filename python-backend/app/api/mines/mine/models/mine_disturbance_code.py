from datetime import datetime

from ....utils.models_mixins import AuditMixin, Base
from app.api.constants import DISTURBANCE_CODES_CONFIG
from app.extensions import db


class MineDisturbanceCode(AuditMixin, Base):
    __tablename__ = 'mine_disturbance_code'
    mine_disturbance_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self):
        return '<MineDisturbanceCode %r>' % self.mine_disturbance_code


    @classmethod
    def all_options(cls):
        return list(map(
            lambda x: {
                'mine_disturbance_code': x[0],
                'description': x[1],
                'mine_tenure_type_codes': DISTURBANCE_CODES_CONFIG[x[0]]['mine_tenure_type_codes'],
                'exclusive_ind': DISTURBANCE_CODES_CONFIG[x[0]]['exclusive_ind']
            },
            cls.query.with_entities(cls.mine_disturbance_code, cls.description).all()
        ))
