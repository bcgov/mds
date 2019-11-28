from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.inspected_location import InspectedLocation
from app.nris.models.document import Document


class InspectedLocationDocumentXref(Base):
    __tablename__ = "inspected_location_document_xref"
    __table_args__ = {
        'comment': 'Contains a reference between inspected location documents and the details of the documents.'}
    inspected_location_id = db.Column(
        db.Integer, db.ForeignKey('inspected_location.inspected_location_id'), primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey(
        'document.document_id'), primary_key=True)

    def __repr__(self):
        return f'<InspectedLocationDocumentXref inspected_location_id={self.inspected_location_id} document_id={self.document_id}>'
