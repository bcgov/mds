from datetime import datetime
from app.extensions import db, api
from flask_restplus import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.order_type import OrderType
from app.nris.models.document import DOCUMENT_RESPONSE_MODEL

ORDER_RESPONSE_MODEL = api.model('order', {
    'order_type': fields.String,
    'documents': fields.List(fields.Nested(DOCUMENT_RESPONSE_MODEL)),
})


class Order(Base):
    __tablename__ = "order"
    order_id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('nris.inspection.inspection_id'))
    location_id = db.Column(db.Integer, db.ForeignKey('nris.location.location_id'))
    location = db.relationship("Location")

    order_type_id = db.Column(db.Integer, db.ForeignKey('nris.order_type.order_type_id'))
    order_type = db.relationship('OrderType', lazy='selectin')
    documents = db.relationship('Document', lazy='selectin', secondary='nris.order_document_xref')

    advisory_details = db.relationship('OrderAdvisoryDetail', lazy='selectin')
    request_details = db.relationship('OrderRequestDetail', lazy='selectin')
    stop_details = db.relationship('OrderStopDetail', lazy='selectin')
    warning_details = db.relationship('OrderWarningDetail', lazy='selectin')

    def __repr__(self):
        return f'<Order order_id={self.order_id}>'
