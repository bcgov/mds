from datetime import datetime
from app.extensions import db, api
from flask_restplus import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.order_type import OrderType
from app.nris.models.document import DOCUMENT_RESPONSE_MODEL
from app.nris.models.location import LOCATION_RESPONSE_MODEL
from app.nris.models.order_advisory_detail import ADVISORY_DETAILS_RESPONSE_MODEL
from app.nris.models.order_request_detail import REQUEST_DETAILS_RESPONSE_MODEL
from app.nris.models.order_stop_detail import STOP_DETAILS_RESPONSE_MODEL
from app.nris.models.order_warning_detail import WARNING_DETAILS_RESPONSE_MODEL

ORDER_RESPONSE_MODEL = api.model(
    'order', {
        'location': fields.Nested(LOCATION_RESPONSE_MODEL),
        'order_type': fields.String,
        'documents': fields.List(fields.Nested(DOCUMENT_RESPONSE_MODEL)),
        'advisory_details': fields.List(fields.Nested(ADVISORY_DETAILS_RESPONSE_MODEL)),
        'request_details': fields.List(fields.Nested(REQUEST_DETAILS_RESPONSE_MODEL)),
        'stop_details': fields.List(fields.Nested(STOP_DETAILS_RESPONSE_MODEL)),
        'warning_details': fields.List(fields.Nested(WARNING_DETAILS_RESPONSE_MODEL)),
    })


class Order(Base):
    __tablename__ = "order"
    order_id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('nris.inspection.inspection_id'))
    location_id = db.Column(db.Integer, db.ForeignKey('nris.location.location_id'))
    location = db.relationship("Location")

    order_type_id = db.Column(db.Integer, db.ForeignKey('nris.order_type.order_type_id'))
    order_type_rel = db.relationship('OrderType', lazy='selectin')
    order_type = association_proxy('order_type_rel', 'order_type')
    documents = db.relationship('Document', lazy='selectin', secondary='nris.order_document_xref')

    advisory_details = db.relationship('OrderAdvisoryDetail', lazy='selectin')
    request_details = db.relationship('OrderRequestDetail', lazy='selectin')
    stop_details = db.relationship('OrderStopDetail', lazy='selectin')
    warning_details = db.relationship('OrderWarningDetail', lazy='selectin')

    def __repr__(self):
        return f'<Order order_id={self.order_id}>'
