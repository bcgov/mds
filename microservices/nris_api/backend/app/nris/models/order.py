from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.order_type import OrderType


class Order(Base):
    __tablename__ = "order"
    order_id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('inspection.inspection_id'))
    location_id = db.Column(db.Integer, db.ForeignKey('location.location_id'))
    location = db.relationship("Location")

    order_type_id = db.Column(db.Integer, db.ForeignKey('order_type.order_type_id'))
    order_type = association_proxy('order_type', 'order_type')
    documents = db.relationship('Document', lazy='selectin', secondary='order_document_xref')
    advisory_details = db.relationship('OrderAdvisoryDetail', lazy='selectin')
    request_details = db.relationship('OrderRequestDetail', lazy='selectin')
    stop_details = db.relationship('OrderStopDetail', lazy='selectin')
    warning_details = db.relationship('OrderWarningDetail', lazy='selectin')

    def __repr__(self):
        return f'<Order order_id={self.order_id}>'
