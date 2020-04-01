import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class UnitType(AuditMixin, Base):
    __tablename__ = 'unit_type'
    unit_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    short_description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
