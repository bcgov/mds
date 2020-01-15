from datetime import datetime
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from sqlalchemy.ext.hybrid import hybrid_property


class MineCommodityTenureType(Base):
    __tablename__ = 'mine_commodity_tenure_type'
    mine_commodity_code = db.Column(
        db.String, db.ForeignKey('mine_commodity_code.mine_commodity_code'), primary_key=True)
    mine_tenure_type_code = db.Column(
        db.String, db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'), primary_key=True)


class MineCommodityCode(AuditMixin, Base):
    __tablename__ = 'mine_commodity_code'
    mine_commodity_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    tenure_types = db.relationship(
        'MineTenureTypeCode',
        lazy='joined',
        secondary='mine_commodity_tenure_type',
        backref='mine_commodity_codes')

    @hybrid_property
    def mine_tenure_type_codes(self):
        return [x.mine_tenure_type_code for x in self.tenure_types]

    def __repr__(self):
        return '<MineCommodityCode %r>' % self.mine_commodity_code

    @classmethod
    def find_by_code(cls, code):
        return cls.query.get(code)

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
