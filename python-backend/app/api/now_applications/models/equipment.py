from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class Equipment(AuditMixin, Base):
    __tablename__ = "equipment"

    equipment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    description = db.Column(db.String)
    quantity = db.Column(db.Integer)
    capacity = db.Column(db.String)

    def __repr__(self):
        return '<Equipment %r>' % self.equipment_id
