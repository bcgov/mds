from datetime import datetime

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from sqlalchemy.ext.hybrid import hybrid_property


class MineDisturbanceTenureType(Base):
    __tablename__ = 'mine_disturbance_tenure_type'
    mine_disturbance_code = db.Column(
        db.String, db.ForeignKey('mine_disturbance_code.mine_disturbance_code'), primary_key=True)
    mine_tenure_type_code = db.Column(
        db.String, db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'), primary_key=True)


class MineDisturbanceCode(AuditMixin, Base):
    __tablename__ = 'mine_disturbance_code'
    mine_disturbance_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    tenure_types = db.relationship(
        'MineTenureTypeCode',
        lazy='joined',
        secondary='mine_disturbance_tenure_type',
        backref='mine_disturbance_codes')

    @hybrid_property
    def mine_tenure_type_codes(self):
        return [x.mine_tenure_type_code for x in self.tenure_types]

    def __repr__(self):
        return '<MineDisturbanceCode %r>' % self.mine_disturbance_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
