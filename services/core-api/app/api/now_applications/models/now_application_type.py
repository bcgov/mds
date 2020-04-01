from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class NOWApplicationType(Base, AuditMixin):
    __tablename__ = "notice_of_work_type"

    notice_of_work_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<NOWType %r>' % self.notice_of_work_type_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
