from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class DocumentType(Base):
    __tablename__ = "document_type"
    __table_args__ = {
        'comment': 'Lookup table that contains a list of inspection document types; i.e. Map, Report, Mine Manager Response, Image, Document, Final Report.'}

    document_type_id = db.Column(db.Integer, primary_key=True)
    document_type = db.Column(db.String(256))

    def __repr__(self):
        return f'<DocumentType document_type_id={self.document_type_id} document_type={self.document_type}>'

    @classmethod
    def find_all_document_types(cls):
        return cls.query.all()
