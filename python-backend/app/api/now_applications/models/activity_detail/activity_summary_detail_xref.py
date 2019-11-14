from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class ActivitySummaryDetailXref(Base):
    __tablename__ = "activity_summary_detail_xref"
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)
    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)
    is_existing = db.Column(db.Boolean)

    summary = db.relationship(
        'ActivitySummaryBase', backref="summary_associations", load_on_pending=True)
    detail = db.relationship(
        'ActivityDetailBase', backref="detail_associations", load_on_pending=True)
