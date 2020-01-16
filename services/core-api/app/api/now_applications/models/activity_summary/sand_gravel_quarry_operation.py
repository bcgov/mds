from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class SandGravelQuarryOperation(ActivitySummaryBase):
    __tablename__ = "sand_gravel_quarry_operation"
    __mapper_args__ = {
        'polymorphic_identity': 'sand_gravel_quarry_operation', ## type code
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    average_overburden_depth = db.Column(db.Numeric(14, 2))
    average_overburden_depth_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    average_top_soil_depth = db.Column(db.Numeric(14, 2))
    average_top_soil_depth_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    stability_measures_description = db.Column(db.String)
    is_agricultural_land_reserve = db.Column(db.Boolean)
    agri_lnd_rsrv_permit_application_number = db.Column(db.String)
    has_local_soil_removal_bylaw = db.Column(db.Boolean)
    community_plan = db.Column(db.String)
    land_use_zoning = db.Column(db.String)
    proposed_land_use = db.Column(db.String)
    total_mineable_reserves = db.Column(db.Integer)
    total_mineable_reserves_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    total_annual_extraction = db.Column(db.Integer)
    total_annual_extraction_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    average_groundwater_depth = db.Column(db.Numeric(14, 1))
    has_groundwater_from_existing_area = db.Column(db.Boolean)
    has_groundwater_from_test_pits = db.Column(db.Boolean)
    has_groundwater_from_test_wells = db.Column(db.Boolean)
    groundwater_from_other_description = db.Column(db.String)
    groundwater_protection_plan = db.Column(db.String)
    nearest_residence_distance = db.Column(db.Integer)
    nearest_residence_distance_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    nearest_water_source_distance = db.Column(db.Integer)
    nearest_water_source_distance_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    noise_impact_plan = db.Column(db.String)
    secure_access_plan = db.Column(db.String)
    dust_impact_plan = db.Column(db.String)
    visual_impact_plan = db.Column(db.String)

    reclamation_backfill_detail = db.Column(db.String)

    details = db.relationship(
        'SandGravelQuarryOperationDetail',
        secondary='activity_summary_detail_xref',
        load_on_pending=True)


def __repr__(self):
    return '<SandGravelQuarryOperation %r>' % self.activity_id
