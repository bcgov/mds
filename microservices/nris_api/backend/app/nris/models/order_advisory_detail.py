from datetime import datetime
from app.extensions import db, api
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base
from flask_restplus import fields

ADVISORY_DETAILS_RESPONSE_MODEL = api.model('order_advisory_detail', {
    'detail': fields.String,
})


class OrderAdvisoryDetail(Base):
    __tablename__ = "order_advisory_detail"
    order_advisory_detail_id = db.Column(db.Integer, primary_key=True)
    inspection_order_id = db.Column(db.Integer,
                                    db.ForeignKey('nris.inspection_order.inspection_order_id'))
    detail = db.Column(db.String())

    def __repr__(self):
        return f'<OrderAdvisoryDetail order_advisory_detail_id={self.order_advisory_detail_id}> inspection_order_id={self.inspection_order_id}'
