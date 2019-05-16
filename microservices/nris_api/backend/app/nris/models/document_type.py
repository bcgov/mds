from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base


class DocumentType(Base):
    __tablename__ = "document_type"
    document_type_id = db.Column(db.Integer, primary_key=True)
    document_type = db.Column(db.Integer)

    def __repr__(self):
        return f'<document_type_id={self.document_type_id} document_type={self.document_type}>'
