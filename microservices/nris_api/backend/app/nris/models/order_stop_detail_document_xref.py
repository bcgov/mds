from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.document import Document


class OrderStopDetailDocumentXref(Base):
    __tablename__ = "order_stop_detail_document_xref"
    __table_args__ = {
        'comment': 'Contains a reference between order documents and the details of the documents.'}
    order_stop_detail_id = db.Column(
        db.Integer, db.ForeignKey('order_stop_detail.order_stop_detail_id'), primary_key=True)
    document_id = db.Column(
        db.Integer, db.ForeignKey('document.document_id'), primary_key=True)

    def __repr__(self):
        return f'<OrderStopDetailDocumentXref order_stop_detail_id={self.order_stop_detail_id} document_id={self.document_id}>'
