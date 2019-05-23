from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.order import Order
from app.nris.models.document import Document


class OrderDocumentXref(Base):
    __tablename__ = "order_document_xref"
    order_id = db.Column(db.Integer, db.ForeignKey('nris.order.order_id'), primary_key=True)
    document_id = db.Column(
        db.Integer, db.ForeignKey('nris.document.document_id'), primary_key=True)

    def __repr__(self):
        return f'<OrderDocumentXref order_id={self.order_id} document_id={self.document_id}>'
