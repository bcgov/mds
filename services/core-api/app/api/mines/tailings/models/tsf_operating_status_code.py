from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class TSFOperatingStatusCode(Base, AuditMixin):
    __tablename__ = "tsf_operating_status"

    tsf_operating_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)
    

    def __repr__(self):
        return '<TSFOperatingStatusCode %r>' % self.tsf_operating_status_code

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()