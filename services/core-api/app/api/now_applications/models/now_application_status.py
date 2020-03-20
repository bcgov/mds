from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class NOWApplicationStatus(Base, AuditMixin):
    __tablename__ = "now_application_status"

    now_application_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<NOWApplicationStatus %r>' % self.now_application_status_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()