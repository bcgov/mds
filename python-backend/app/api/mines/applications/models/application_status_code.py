import json
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ApplicationStatusCode(AuditMixin, Base):
    __tablename__ = 'application_status_code'
    application_status_code = db.Column(db.String(3),
                                        primary_key=True,
                                        server_default=FetchedValue())
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<ApplicationStatusCode %r>' % self.application_status_code

    @classmethod
    def find_by_application_status_code(cls, code):
        return cls.query.filter_by(application_status_code=code).first()

    @classmethod
    def find_all_active(cls):
        return cls.query.filter_by(active_ind=True).all()
