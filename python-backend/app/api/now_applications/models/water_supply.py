import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class WaterSupply(AuditMixin, Base):
    __tablename__ = 'water_supply'
    water_supply_id = db.Column(db.Integer, primary_key=True)
    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), nullable=False)
    supply_source_description = db.Column(db.String)
    supply_source_type = db.Column(db.String)
    water_use_description = db.Column(db.String)
    estimate_rate = db.Column(db.Numeric(14, 2))
    pump_size = db.Column(db.Numeric(14, 2))
    intake_location = db.Column(db.String)

    now_application = db.relationship('NOWApplication')