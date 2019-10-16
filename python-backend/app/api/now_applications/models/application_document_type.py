import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ApplicationDocumentType(AuditMixin, Base):
    __tablename__ = 'application_document_type'
    application_document_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(4000), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def active(cls):
        return cls.query.filter_by(active_ind=True).all()
