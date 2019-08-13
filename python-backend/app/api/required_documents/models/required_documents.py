from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ..models.required_document_categories import RequiredDocumentCategory
from ..models.required_document_due_date_type import RequiredDocumentDueDateType
from ..models.required_document_sub_categories import RequiredDocumentSubCategory
from app.api.utils.models_mixins import AuditMixin, Base


class RequiredDocument(AuditMixin, Base):
    __tablename__ = 'mds_required_document'
    req_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    req_document_name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    req_document_due_date_period_months = db.Column(db.Integer, nullable=False)
    req_document_category = db.Column(
        db.String, db.ForeignKey('mine_required_document_category.req_document_category'))
    req_document_sub_category_code = db.Column(
        db.String, db.ForeignKey('required_document_sub_category.req_document_sub_category_code'))
    req_document_due_date_type = db.Column(
        db.String(3), db.ForeignKey('required_document_due_date_type.req_document_due_date_type'))
    hsrc_code = db.Column(db.String)
    db.relationship('RequiredDocumentDueDateType', backref='req_document_guid', lazy='joined')

    @classmethod
    def find_by_req_doc_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(req_document_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_req_doc_category(cls, category, sub_category=None):
        try:
            result = cls.query.filter_by(req_document_category=category)
            if sub_category:
                result = result.filter_by(req_document_sub_category_code=sub_category)
            return result.all()
        except ValueError:
            return None