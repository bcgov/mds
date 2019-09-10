from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.inspection import Inspection
from app.nris.models.document import Document


class InspectionDocumentXref(Base):
    __tablename__ = "inspection_document_xref"
    __table_args__ = {
        'comment': 'Contains a reference between inspection documents and the details of the documents.'}
    inspection_id = db.Column(
        db.Integer, db.ForeignKey('inspection.inspection_id'), primary_key=True)
    document_id = db.Column(
        db.Integer, db.ForeignKey('document.document_id'), primary_key=True)

    def __repr__(self):
        return f'<InspectionDocumentXref inspection_id={self.inspection_id} document_id={self.document_id}>'
