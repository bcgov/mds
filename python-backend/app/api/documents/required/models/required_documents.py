from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ..models.required_document_categories import RequiredDocumentCategory

from ....utils.models_mixins import AuditMixin, Base


class RequiredDocument(AuditMixin, Base):
    __tablename__ = 'mds_required_document'
    req_document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue()) 
    req_document_name = db.Column(db.String(100), nullable=False)
    req_document_description = db.Column(db.String(300))

    req_document_category_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mds_required_document_category.req_document_category_guid'))
    req_document_category = db.relationship('RequiredDocumentCategory',backref='req_document_guid',order_by='desc(RequiredDocumentCategory.req_document_category)', lazy='joined')

    def json(self):
        return {
            'req_document_guid': str(self.req_document_guid),
            'req_document_name': str(self.req_document_name),
            'req_document_description': str(self.req_document_description),
            'req_document_category' : str(self.req_document_category.req_document_category)
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
            return cls.query.filter(cls.req_document_category.has(req_document_category=category)).all()
        except ValueError:
            return None