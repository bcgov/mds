from datetime import datetime
from app.extensions import db, api
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base
from flask_restx import fields

ADVISORY_DETAILS_RESPONSE_MODEL = api.model('order_advisory_detail', {
    'detail': fields.String,
})


class OrderAdvisoryDetail(Base):
    __tablename__ = "order_advisory_detail"
    __table_args__ = {'comment': 'For each inspection observation, this table contains details of advisories issued by an inspector. An advisory is a written notification to a person that draws attention to a specific regulatory requirement. An advisory is used where the proponent is in compliance at the moment of inspection but may be at risk of future non-compliance.'}
    order_advisory_detail_id = db.Column(db.Integer, primary_key=True)
    inspected_locations_id = db.Column(db.Integer,
                                       db.ForeignKey('inspected_location.inspected_location_id'))
    detail = db.Column(db.String())

    def __repr__(self):
        return f'<OrderAdvisoryDetail order_advisory_detail_id={self.order_advisory_detail_id}> inspected_location_id={self.inspected_location_id}'
