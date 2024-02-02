from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class SettlingPond(ActivitySummaryBase):
    __tablename__ = "settling_pond"
    __mapper_args__ = {
        'polymorphic_identity': 'settling_pond', ## type code
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    proponent_pond_name = db.Column(db.String)
    wastewater_facility_description = db.Column(db.String)
    disposal_from_clean_out = db.Column(db.String)
    sediment_control_structure_description = db.Column(db.String)
    decant_structure_description = db.Column(db.String)
    water_discharged_description = db.Column(db.String)
    spillway_design_description = db.Column(db.String)

    is_ponds_exfiltrated = db.Column(db.Boolean)
    is_ponds_recycled = db.Column(db.Boolean)
    is_ponds_discharged = db.Column(db.Boolean)

    details = db.relationship(
        'SettlingPondDetail', secondary='activity_summary_detail_xref', load_on_pending=True, overlaps='detail,detail_associations,summary,summary_associations')

    @hybrid_property
    def calculated_total_disturbance(self):
        return self.calculate_total_disturbance_area(self.details)

    def __repr__(self):
        return '<SettlingPond %r>' % self.activity_summary_id
