from datetime import datetime
from sqlalchemy.schema import FetchedValue

from ....utils.models_mixins import AuditMixin, Base
from app.api.constants import COMMODITY_CODES_CONFIG, METALS_AND_MINERALS
from app.extensions import db


class MineCommodityCode(AuditMixin, Base):
    __tablename__ = 'mine_commodity_code'
    mine_commodity_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MineCommodityCode %r>' % self.mine_commodity_code


    @classmethod
    def all_options(cls):
        return list(map(
            lambda x: {
                'mine_commodity_code': x[0],
                'description': x[1],
                'mine_tenure_type_codes': COMMODITY_CODES_CONFIG[x[0]]['mine_tenure_type_codes'],
                'exclusive_ind': COMMODITY_CODES_CONFIG[x[0]]['exclusive_ind']
            },
            cls.query
               .with_entities(cls.mine_commodity_code, cls.description)
               .filter_by(active_ind=True)
               .all()
        ))
