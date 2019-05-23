from datetime import datetime
from app.extensions import db, api
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base
from flask_restplus import fields

REQUEST_DETAILS_RESPONSE_MODEL = api.model('order_request_detail', {
    'detail': fields.String,
    'response': fields.String,
    'respond_date': fields.Date,
})


class OrderRequestDetail(Base):
    __tablename__ = "order_request_detail"
    order_request_detail_id = db.Column(db.Integer, primary_key=True)
    inspection_order_id = db.Column(db.Integer,
                                    db.ForeignKey('nris.inspection_order.inspection_order_id'))
    detail = db.Column(db.String())
    response = db.Column(db.String())
    respond_date = db.Column(db.DateTime)

    def __repr__(self):
        return f'<OrderRequestDetail order_request_detail_id={self.order_request_detail_id}> inspection_order_id={self.inspection_order_id}'
