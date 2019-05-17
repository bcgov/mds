from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base

from app.nris.models.order_type import OrderType


class Order(Base):
    __tablename__ = "order"
    order_id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey('inspection.inspection_id'))
    order_type_id = db.Column(db.Integer, db.ForeignKey('order_type.order_type_id'))
    order_type = association_proxy('order_type', 'order_type')
    locations = db.relationship('Location', lazy='selectin')
    documents = db.relationship('Document', lazy='selectin', secondary='order_document_xref')

    def __repr__(self):
        return f'<Order order_id={self.order_id}>'
