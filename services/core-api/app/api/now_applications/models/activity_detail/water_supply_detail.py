from app.extensions import db
from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class WaterSupplyDetail(ActivityDetailBase):
    __tablename__ = 'water_supply_detail'

    __mapper_args__ = {'polymorphic_identity': 'water_supply'}

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    supply_source_description = db.Column(db.String)
    supply_source_type = db.Column(db.String)
    water_use_description = db.Column(db.String)
    estimate_rate = db.Column(db.Numeric(14, 7))
    estimate_rate_unit_type_code = db.Column(db.String)
    pump_size = db.Column(db.Numeric(14, 2))
    intake_location = db.Column(db.String)
