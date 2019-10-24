from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class WaterSupply(ActivitySummaryBase):
    __tablename__ = "water_supply"
    __mapper_args__ = {
        'polymorphic_identity': 'water_supply',  ## type code
    }

    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity.activity_summary_id'), primary_key=True)

    water_use_description = db.Column(db.String)
    estimate_rate = db.Column(db.Numeric(14, 2))
    pump_size = db.Column(db.Numeric(14, 2))
    intake_location = db.Column(db.String)

    details = db.relationship('WaterSupplyDetail', secondary='activity_summary_detail_xref')

    def __repr__(self):
        return '<WaterSupply %r>' % self.activity_summary_id
