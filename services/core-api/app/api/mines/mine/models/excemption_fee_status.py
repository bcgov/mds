from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base

class ExemptionFeeStatus(Base, AuditMixin):
    __tablename__ = 'exemption_fee_status'
    exemption_fee_status_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<ExemptionFeeStatus %r>' % self.exemption_fee_status_code

    @classmethod
    def find_by_exemption_fee_status_code(cls, _code):
        return cls.query.filter_by(exemption_fee_status_code=_code).first()

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()