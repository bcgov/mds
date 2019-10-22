import uuid, datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import AuditMixin, Base

from app.api.now_applications.models.activity_detail.activity_summary_detail_xref import *
from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class ActivityDetailBase(AuditMixin, Base):
    __tablename__ = 'activity_detail'

    activity_detail_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    activity_type_description = db.Column(db.String)
    disturbed_area = db.Column(db.Numeric(14, 2))
    timber_volume = db.Column(db.Numeric(14, 2))
    number_of_sites = db.Column(db.Integer)
    width = db.Column(db.Integer)
    length = db.Column(db.Integer)
    depth = db.Column(db.Integer)
    quantity = db.Column(db.Integer)
    incline = db.Column(db.Numeric(14, 2))
    incline_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    cut_line_length = db.Column(db.Integer)
    water_quantity = db.Column(db.Integer)
    water_quantity_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))

    #activity_type_code = 'hardcode'

    activity_summaries = db.relationship('ActivitySummaryBase',
                                         secondary='activity_summary_detail_xref')
    activity_type_code = db.column_property(
        db.select(
            [ActivitySummaryBase.activity_type_code],
            and_(
                ActivitySummaryDetailXref.activity_summary_id ==
                ActivitySummaryBase.activity_summary_id,
                ActivitySummaryDetailXref.activity_detail_id == activity_detail_id)).as_scalar())
    #activity_type_code = association_proxy('activity_summary', 'activity_type_code')

    __mapper_args__ = {'polymorphic_on': activity_type_code}