from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class RequiredDocument(AuditMixin, Base):
    __tablename__ = 'mds_required_document'
    req_document_guid = db.Column(UUID(as_uuid=True), primary_key=True) 
    req_document_name = db.Column(db.String(60), nullable=False)
    req_document_description = db.Column(db.String(300))
    req_document_category = db.Column(db.String(60))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) 
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))


    def json(self):
        return {
            'req_document_guid': str(self.req_document_guid),
            'req_document_name': str(self.req_document_name),
            'req_document_description': str(self.req_document_description),
            'req_document_category': str(self.req_document_category),
        }

    @classmethod
    def find_by_req_doc_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(req_document_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_req_doc_category(cls, category):
        try:
            return cls.query.filter_by(req_document_category=category).all()
        except ValueError:
            return None