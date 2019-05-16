from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base


class InspectionDocumentXref(Base):
    __tablename__ = "inspection_document_xref"
    inspection_id = db.Column(db.Integer, db.ForeignKey('inspection.inspection_id'))
    document_id = db.Column(db.Integer, db.ForeignKey('document.document_id'))

    def __repr__(self):
        return f'<InspectionDocumentXref inspection_id={self.inspection_id} document_id={self.document_id}>'
