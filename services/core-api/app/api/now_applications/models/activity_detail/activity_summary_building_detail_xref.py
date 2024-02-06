from app.api.utils.models_mixins import Base
from app.extensions import db


class ActivitySummaryBuildingDetailXref(Base):
    __tablename__ = 'activity_summary_building_detail_xref'
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)
    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id', ondelete='CASCADE'), primary_key=True)

    summary = db.relationship(
        'ActivitySummaryBase', backref='building_summary_associations', load_on_pending=True, overlaps='building_summary_associations,summary')
    detail = db.relationship(
        'ActivityDetailBase', backref='building_detail_associations', load_on_pending=True, overlaps='building_summary_associations,summary')
