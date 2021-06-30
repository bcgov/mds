import uuid, datetime
from marshmallow import fields
from sqlalchemy import and_, select, or_, join, nullslast
from sqlalchemy.orm import column_property, deferred
from flask import current_app
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from sqlalchemy.ext.associationproxy import association_proxy
from app.api.utils.models_mixins import AuditMixin, Base
from sqlalchemy.ext.declarative import declared_attr

from app.api.now_applications.models.activity_detail.activity_summary_detail_xref import ActivitySummaryDetailXref
from app.api.now_applications.models.activity_detail.activity_summary_staging_area_detail_xref import ActivitySummaryStagingAreaDetailXref
from app.api.now_applications.models.activity_detail.activity_summary_building_detail_xref import ActivitySummaryBuildingDetailXref
from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase
from app.api.now_applications.models.activity_summary.activity_type import ActivityType
from app.api.constants import NOW_APPLICATION_EDIT_GROUP


class ActivityDetailBase(AuditMixin, Base):
    __tablename__ = 'activity_detail'

    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    class _ModelSchema(Base._ModelSchema):
        activity_type_code = fields.String(dump_only=True)
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

    _etl_activity_details = db.relationship('ETLActivityDetail', load_on_pending=True)

    # activity_summary = db.relationship(
    #     'ActivitySummaryBase',
    #     primaryjoin='\
    #         or_(\
    #             and_(\
    #                 ActivitySummaryDetailXref.activity_summary_id ==\
    #                 ActivitySummaryBase.activity_summary_id,\
    #                 ActivitySummaryDetailXref.activity_detail_id == activity_detail_id),\
    #             and_(\
    #                 ActivitySummaryStagingAreaDetailXref.activity_summary_id ==\
    #                 ActivitySummaryBase.activity_summary_id,\
    #                 ActivitySummaryStagingAreaDetailXref.activity_detail_id == activity_detail_id),\
    #             and_(\
    #                 ActivitySummaryBuildingDetailXref.activity_summary_id ==\
    #                 ActivitySummaryBase.activity_summary_id,\
    #                 ActivitySummaryBuildingDetailXref.activity_detail_id ==\
    #                 activity_detail_id)\
    #             )\
    # ')

    # activity_type_code = association_proxy('activity_summary', 'activity_type_code')

    # activity_type_code = db.column_property(
    #     db.select([ActivitySummaryBase.activity_type_code]).where(
    #         (ActivitySummaryDetailXref.activity_summary_id
    #          == ActivitySummaryBase.activity_summary_id
    #          and ActivitySummaryDetailXref.activity_detail_id == activity_detail_id)
    #         or (ActivitySummaryStagingAreaDetailXref.activity_summary_id
    #             == ActivitySummaryBase.activity_summary_id
    #             and ActivitySummaryStagingAreaDetailXref.activity_detail_id == activity_detail_id)
    #         or (ActivitySummaryBuildingDetailXref.activity_summary_id
    #             == ActivitySummaryBase.activity_summary_id
    #             and ActivitySummaryBuildingDetailXref.activity_detail_id
    #             == activity_detail_id)).limit(1).as_scalar())

    # @declared_attr
    # def activity_type_code(cls):
    #     return db.column_property(
    #         db.select([ActivitySummaryBase.activity_type_code]).where(
    #             or_(
    #                 and_(
    #                     ActivitySummaryDetailXref.activity_summary_id ==
    #                     ActivitySummaryBase.activity_summary_id,
    #                     ActivitySummaryDetailXref.activity_detail_id == cls.activity_detail_id),
    #                 and_(
    #                     ActivitySummaryStagingAreaDetailXref.activity_summary_id ==
    #                     ActivitySummaryBase.activity_summary_id,
    #                     ActivitySummaryStagingAreaDetailXref.activity_detail_id ==
    #                     cls.activity_detail_id),
    #                 and_(
    #                     ActivitySummaryBuildingDetailXref.activity_summary_id ==
    #                     ActivitySummaryBase.activity_summary_id,
    #                     ActivitySummaryBuildingDetailXref.activity_detail_id ==
    #                     cls.activity_detail_id))),
    #         deferred=True)

    activity_type_code = db.column_property(
        db.select([ActivityType.activity_type_code]).where(
            and_(
                ActivityType.activity_type_code == ActivitySummaryBase.activity_type_code,
                and_(
                    ActivitySummaryDetailXref.activity_summary_id ==
                    ActivitySummaryBase.activity_summary_id,
                    ActivitySummaryDetailXref.activity_detail_id == activity_detail_id),
                and_(
                    ActivitySummaryStagingAreaDetailXref.activity_summary_id ==
                    ActivitySummaryBase.activity_summary_id,
                    ActivitySummaryStagingAreaDetailXref.activity_detail_id == activity_detail_id),
                and_(
                    ActivitySummaryBuildingDetailXref.activity_summary_id ==
                    ActivitySummaryBase.activity_summary_id,
                    ActivitySummaryBuildingDetailXref.activity_detail_id ==
                    activity_detail_id))).limit(1).as_scalar())

    @hybrid_property
    def foo(self):
        current_app.logger.info(
            '***************************************************************************')
        current_app.logger.info(str(self.activity_detail_id))
        current_app.logger.info(str(self.activity_type_code))
        return None

    # activity_type_code = db.column_property(
    #     db.select([ActivitySummaryBase.activity_type_code],
    #               or_(
    #                   and_(
    #                       ActivitySummaryDetailXref.activity_summary_id ==
    #                       ActivitySummaryBase.activity_summary_id,
    #                       ActivitySummaryDetailXref.activity_detail_id == activity_detail_id),
    #                   and_(
    #                       ActivitySummaryStagingAreaDetailXref.activity_summary_id ==
    #                       ActivitySummaryBase.activity_summary_id,
    #                       ActivitySummaryStagingAreaDetailXref.activity_detail_id ==
    #                       activity_detail_id))).limit(1).as_scalar())

    # activity_type_code = db.column_property(
    #     db.select(
    #         [ActivitySummaryBase.activity_type_code],
    #         or_(
    #             and_(
    #                 ActivitySummaryDetailXref.activity_summary_id ==
    #                 ActivitySummaryBase.activity_summary_id,
    #                 ActivitySummaryDetailXref.activity_detail_id == activity_detail_id),
    #             and_(
    #                 ActivitySummaryStagingAreaDetailXref.activity_summary_id ==
    #                 ActivitySummaryBase.activity_summary_id,
    #                 ActivitySummaryStagingAreaDetailXref.activity_detail_id == activity_detail_id),
    #             and_(
    #                 ActivitySummaryBuildingDetailXref.activity_summary_id ==
    #                 ActivitySummaryBase.activity_summary_id,
    #                 ActivitySummaryBuildingDetailXref.activity_detail_id ==
    #                 activity_detail_id))).limit(1).as_scalar())

    # activity_type_code = column_property(
    #     select([ActivitySummaryBase.activity_type_code]).select_from(
    #         ActivitySummaryBase.query.outerjoin(
    #             ActivitySummaryDetailXref,
    #             and_(
    #                 ActivitySummaryDetailXref.activity_summary_id ==
    #                 ActivitySummaryBase.activity_summary_id,
    #                 ActivitySummaryDetailXref.activity_detail_id == activity_detail_id)).outerjoin(
    #                     ActivitySummaryStagingAreaDetailXref,
    #                     and_(
    #                         ActivitySummaryStagingAreaDetailXref.activity_summary_id ==
    #                         ActivitySummaryBase.activity_summary_id,
    #                         ActivitySummaryStagingAreaDetailXref.activity_detail_id ==
    #                         activity_detail_id)).outerjoin(
    #                             ActivitySummaryBuildingDetailXref,
    #                             and_(
    #                                 ActivitySummaryBuildingDetailXref.activity_summary_id ==
    #                                 ActivitySummaryBase.activity_summary_id,
    #                                 ActivitySummaryBuildingDetailXref.activity_detail_id ==
    #                                 activity_detail_id))).limit(1).as_scalar())

    __mapper_args__ = {'polymorphic_on': activity_type_code}

    def delete(self, commit=True):
        for item in self.detail_associations:
            item.delete(commit)
        for item in self._etl_activity_details:
            item.delete(commit)
        super(ActivityDetailBase, self).delete(commit)