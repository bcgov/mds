from datetime import datetime
from sqlalchemy.schema import FetchedValue

from ....utils.models_mixins import AuditMixin, Base
from app.api.constants import COMMODITY_CODES_CONFIG, METALS_AND_MINERALS
from app.extensions import db


class MineCommodityTenureType(Base):
    __tablename__ = 'mine_commodity_tenure_type'
    mine_commodity_code = db.Column(db.String,
                                    db.ForeignKey('mine_commodity_code.mine_commodity_code'),
                                    primary_key=True)
    mine_tenure_type_code = db.Column(db.String,
                                      db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'),
                                      primary_key=True)


class MineCommodityCode(AuditMixin, Base):
    __tablename__ = 'mine_commodity_code'
    mine_commodity_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    tenure_types = db.relationship('MineTenureTypeCode', secondary='mine_commodity_tenure_type')

    def __repr__(self):
        return '<MineCommodityCode %r>' % self.mine_commodity_code

    @classmethod
    def all_options(cls):
        return list(
            map(
                lambda x: {
                    'mine_commodity_code': x.mine_commodity_code,
                    'description': x.description,
                    'mine_tenure_type_codes': [y.mine_tenure_type_code for y in x.tenure_types],
                    'exclusive_ind': COMMODITY_CODES_CONFIG[x.mine_commodity_code]['exclusive_ind']
                },
                cls.query.filter_by(active_ind=True).all()))
