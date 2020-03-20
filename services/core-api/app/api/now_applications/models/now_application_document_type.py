import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class NOWApplicationDocumentType(AuditMixin, Base):
    __tablename__ = 'now_application_document_type'
    now_application_document_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    document_template_code = db.Column(db.String,
                                       db.ForeignKey('document_template.document_template_code'))

    document_template = db.relationship("DocumentTemplate", backref="now_application_document_type")

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()

    @classmethod
    def get_with_context(cls, document_type_code, context_guid):
        document_type = cls.query.get(document_type_code)
        if context_guid:
            document_type.document_template.context_primary_key = context_guid
        return document_type