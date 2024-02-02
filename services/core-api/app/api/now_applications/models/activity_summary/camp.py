from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class Camp(ActivitySummaryBase):
    __tablename__ = "camp"
    __mapper_args__ = {
        'polymorphic_identity': 'camp',          ## type code
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    health_authority_notified = db.Column(db.Boolean)
    health_authority_consent = db.Column(db.Boolean)
    has_fuel_stored = db.Column(db.Boolean)
    has_fuel_stored_in_bulk = db.Column(db.Boolean)
    has_fuel_stored_in_barrels = db.Column(db.Boolean)
    volume_fuel_stored = db.Column(db.Numeric(14, 2))

    details = db.relationship(
        'CampDetail', secondary='activity_summary_detail_xref', load_on_pending=True, overlaps='building_detail_associations,detail,detail_associations,summary,summary_associations')
    staging_area_details = db.relationship(
        'StagingAreaDetail',
        secondary='activity_summary_staging_area_detail_xref',
        load_on_pending=True,
        overlaps='staging_area_detail_associations,staging_area_summary_associations,summary')
    building_details = db.relationship(
        'BuildingDetail', secondary='activity_summary_building_detail_xref', load_on_pending=True, overlaps='building_detail_associations,detail,building_summary_associations,summary')

    @hybrid_property
    def calculated_total_disturbance_camp(self):
        return self.calculate_total_disturbance_area(self.details)

    @hybrid_property
    def calculated_total_disturbance_staging_area(self):
        return self.calculate_total_disturbance_area(self.staging_area_details)

    @hybrid_property
    def calculated_total_disturbance_building(self):
        return self.calculate_total_disturbance_area(self.building_details)


# The UI displays the disturbance for Camps/Building/stagingAreas as one value. The data is stored in different details tables.

    @hybrid_property
    def calculated_total_disturbance(self):
        return (self.calculated_total_disturbance_camp
                or 0) + (self.calculated_total_disturbance_staging_area or 0) + (
                    self.calculated_total_disturbance_building or 0)

    def __repr__(self):
        return '<Camp %r>' % self.activity_summary_id
