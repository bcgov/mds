from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.inspection_order import InspectionOrder
from app.nris.models.document import Document


class OrderDocumentXref(Base):
    __tablename__ = "order_document_xref"
    inspection_order_id = db.Column(
        db.Integer, db.ForeignKey('inspection_order.inspection_order_id'), primary_key=True)
    document_id = db.Column(
        db.Integer, db.ForeignKey('document.document_id'), primary_key=True)

    def __repr__(self):
        return f'<OrderDocumentXref inspection_order_id={self.inspection_order_id} document_id={self.document_id}>'
