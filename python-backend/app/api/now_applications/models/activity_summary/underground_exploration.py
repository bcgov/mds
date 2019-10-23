from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class UndergroundExploration(ActivitySummaryBase):
    __tablename__ = "underground_exploration"
    __mapper_args__ = {
        'polymorphic_identity': 'underground_exploration',  ## type code
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity.activity_summary_id'), primary_key=True)

    underground_exploration_type_code - db.Column(
        db.String, db.ForeignKey('underground_exploration_type.underground_exploration_type_code'))

    total_ore_amount = db.Column(db.Integer)
    total_ore_amount_unit_type_code = db.Column(db.String,
                                                db.ForeignKey('unit_type.unit_type_code'))
    total_waste_amount = db.Column(db.Integer)
    total_waste_amount_unit_type_code = db.Column(db.String,
                                                  db.ForeignKey('unit_type.unit_type_code'))

    def __repr__(self):
        return '<UndergroundExploration %r>' % self.activity_summary_id
