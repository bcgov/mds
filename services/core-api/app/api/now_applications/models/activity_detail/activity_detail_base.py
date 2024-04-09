from marshmallow import fields
from sqlalchemy import and_, func
from sqlalchemy.schema import FetchedValue
from sqlalchemy.sql import text, case
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base

from app.api.now_applications.models.activity_detail.activity_summary_detail_xref import ActivitySummaryDetailXref
from app.api.now_applications.models.activity_detail.activity_summary_staging_area_detail_xref import ActivitySummaryStagingAreaDetailXref
from app.api.now_applications.models.activity_detail.activity_summary_building_detail_xref import ActivitySummaryBuildingDetailXref
from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase
from app.api.constants import NOW_APPLICATION_EDIT_GROUP


class ActivityDetailBase(AuditMixin, Base):
    __tablename__ = 'activity_detail'

    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    class _ModelSchema(Base._ModelSchema):
        activity_type_code = fields.String(dump_only=True)
        _activity_type_code_identity = fields.String(dump_only=True)
        activity_detail_id = fields.Integer(dump_only=True)

    activity_detail_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    activity_type_description = db.Column(db.String)
    disturbed_area = db.Column(db.Numeric)
    disturbed_area_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    timber_volume = db.Column(db.Numeric(14, 2))
    timber_volume_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    number_of_sites = db.Column(db.Integer)
    width = db.Column(db.Numeric(14, 2))
    width_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    length = db.Column(db.Numeric(14, 2))
    length_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    depth = db.Column(db.Numeric(14, 2))
    depth_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    height = db.Column(db.Numeric(14, 2))
    height_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    quantity = db.Column(db.Numeric(14, 2))
    incline = db.Column(db.Numeric(14, 2))
    incline_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    cut_line_length = db.Column(db.Numeric(14, 2))
    cut_line_length_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    water_quantity = db.Column(db.Numeric(14, 2))
    water_quantity_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))

    _etl_activity_details = db.relationship('ETLActivityDetail', load_on_pending=True, back_populates='activity_detail')
    
    activitySummaryBuildingDetailXrefChild = db.relationship('ActivitySummaryBuildingDetailXref', backref='activity_detail', cascade='all,delete-orphan', overlaps='building_detail_associations,building_details,detail')
    activitySummaryStagingAreaDetailXrefChild = db.relationship('ActivitySummaryStagingAreaDetailXref', backref='activity_detail', cascade='all,delete-orphan', overlaps='detail,staging_area_detail_associations,staging_area_details')

    # Here be dragons...
    # This is a polymorphic association that is used to determine the type of the activity detail.
    # Why is this needed? Activity Summary Staging Area and Building Detail have an activity type code of 'camp',
    # so that alone is not enough to determine a type that can be used as a unique polyomporphic identity.
    # So? Pre Feb 2024 (running SQLAlchemy 1.3), this just produced a warning and continued to "work" with bugs described here: https://bcmines.atlassian.net/browse/MDS-5494
    # Post Feb 2024 (running SQLAlchemy 1.4), this produces an error and the lookup fails.
    # Solution: Use a column_property to determine a unique polymorphic_identity based on the presence of a related record in the xref table.
    # for staging_area / building.
    _activity_type_code_identity = db.column_property(
        func.coalesce(
            db.select([ActivitySummaryBase.activity_type_code]).where(
                and_(
                    ActivitySummaryDetailXref.activity_summary_id ==
                    ActivitySummaryBase.activity_summary_id,
                    ActivitySummaryDetailXref.activity_detail_id == activity_detail_id)).limit(
                        1).as_scalar(),
            db.select([text("'staging_area'")]).where(
                and_(
                    ActivitySummaryStagingAreaDetailXref.activity_summary_id ==
                    ActivitySummaryBase.activity_summary_id,
                    ActivitySummaryStagingAreaDetailXref.activity_detail_id == activity_detail_id,
                    ActivitySummaryBase.activity_type_code == 'camp')).limit(1).as_scalar(),
            db.select([text("'building'")]).where(
                and_(
                    ActivitySummaryBuildingDetailXref.activity_summary_id ==
                    ActivitySummaryBase.activity_summary_id,
                    ActivitySummaryBuildingDetailXref.activity_detail_id == activity_detail_id,
                    ActivitySummaryBase.activity_type_code == 'camp')).limit(1).as_scalar()))

    activity_type_code = db.column_property(
        case([(_activity_type_code_identity in ['building', 'staging_area'], 'camp')], else_=_activity_type_code_identity))

    __mapper_args__ = {'polymorphic_on': _activity_type_code_identity}

    def delete(self, commit=True):
        for item in self.detail_associations:
            item.delete(commit)
        for item in self._etl_activity_details:
            item.delete(commit)
        super(ActivityDetailBase, self).delete(commit)
