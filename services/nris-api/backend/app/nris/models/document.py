from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.document_type import DocumentType

DOCUMENT_RESPONSE_MODEL = api.model(
    'document', {
        'external_id': fields.Integer,
        'document_date': fields.DateTime,
        'document_type': fields.String,
        'file_name': fields.String,
        'comment': fields.String,
    })


class Document(Base):
    __tablename__ = "document"
    __table_args__ = {
        'comment':
        'A document is any type of additional documentation that has been generated during the INSPECTION process and is attached as part of the INSPECTION record. An example would be a photograph that was taken of the effluent being released during the inspection.'
    }
    document_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    document_date = db.Column(db.DateTime)
    document_type_id = db.Column(db.Integer, db.ForeignKey('document_type.document_type_id'))
    document_type_rel = db.relationship("DocumentType", lazy='selectin')
    document_type = association_proxy('document_type_rel', 'document_type')
    file_name = db.Column(db.String(10485760))
    comment = db.Column(db.String(10485760))

    def __repr__(self):
        return f'<Document document_id={self.document_id} file_name={self.file_name}>'
