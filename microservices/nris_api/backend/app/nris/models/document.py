from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base

from app.nris.models.document_type import DocumentType


class Document(Base):
    __tablename__ = "document"
    document_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    document_date = db.Column(db.DateTime)
    document_type_id = db.Column(db.Integer, db.ForeignKey('document_type.document_type_id'))
    document_type = association_proxy('document_type', 'document_type')
    file_name = db.Column(db.String(1024))
    comment = (db.String(1024))

    def __repr__(self):
        return f'<Document document_id={self.document_id} file_name={self.file_name}>'
