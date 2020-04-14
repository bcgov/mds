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
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<NOWApplicationStatus %r>' % self.now_application_status_code

    @classmethod
    def find_by_now_application_status_code(cls, code):
        return cls.query.filter_by(now_application_status_code=code).first()

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).order_by(cls.display_order).all()