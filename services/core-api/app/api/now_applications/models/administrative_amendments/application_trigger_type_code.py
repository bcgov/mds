from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base
from app.extensions import db


class ApplicationTriggerTypeCode(Base):
    __tablename__ = 'application_trigger_type_code'
    application_trigger_type_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<ApplicationTriggerTypeCode %r>' % self.application_trigger_type_code

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).all()