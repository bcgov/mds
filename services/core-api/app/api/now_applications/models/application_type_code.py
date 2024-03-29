from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class ApplicationTypeCode(Base, AuditMixin):
    __tablename__ = "application_type_code"

    application_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<ApplicationTypeCode %r>' % self.application_type_code

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_application_type_code(cls,application_type_code):
        return cls.query.filter_by(application_type_code = application_type_code).first()