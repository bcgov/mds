from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class UndergroundExploration(ActivitySummaryBase):
    __tablename__ = "underground_exploration"
    __mapper_args__ = {
        'polymorphic_identity': 'underground_exploration', ## type code
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    total_ore_amount = db.Column(db.Numeric(14, 2))
    total_ore_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    total_waste_amount = db.Column(db.Numeric(14, 2))
    total_waste_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    proposed_activity = db.Column(db.String)
    proposed_bulk_sample= db.Column(db.Boolean)
    proposed_de_watering= db.Column(db.Boolean)
    proposed_diamond_drilling= db.Column(db.Boolean)
    proposed_mapping_chip_sampling= db.Column(db.Boolean)
    proposed_new_development= db.Column(db.Boolean)
    proposed_rehab= db.Column(db.Boolean)
    proposed_underground_fuel_storage= db.Column(db.Boolean)
    surface_total_ore_amount=db.Column(db.Numeric)
    surface_total_waste_amount=db.Column(db.Numeric)
    surface_total_ore_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    surface_total_waste_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))

    details = db.relationship(
        'UndergroundExplorationDetail',
        secondary='activity_summary_detail_xref',
        load_on_pending=True,
        overlaps='detail,detail_associations,summary,summary_associations'
    )
    
    @hybrid_property
    def calculated_total_disturbance(self):
        return self.calculate_total_disturbance_area(self.details)

    def __repr__(self):
        return '<UndergroundExploration %r>' % self.activity_summary_id
