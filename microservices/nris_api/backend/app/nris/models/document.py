from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base


class Document(Base):
    __tablename__ = "document"
    document_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    file_name = db.Column(db.String)
    document_type_id = db.Column(db.Integer, db.ForeignKey('document_type.document_type_id'))
    document_type = association_proxy('document_type', 'document_type')

    input_val = db.Column(db.Integer, nullable=False, unique=True)
    output_val = db.Column(db.Integer, nullable=False)
    exec_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __repr__(self):
        return f'<inspection_id={self.inspection_status_code} inspection_status_description={self.inspection_status_description}>'
