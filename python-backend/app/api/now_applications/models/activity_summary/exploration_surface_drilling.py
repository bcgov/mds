from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class ExplorationSurfaceDrilling(ActivitySummaryBase):
    __tablename__ = "exploration_surface_drilling"
    __mapper_args__ = {
        'polymorphic_identity': 'exploration_surface_drilling',
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)
    reclamation_core_storage = db.Column(db.String)

    details = db.relationship(
        'ExplorationSurfaceDrillingDetail',
        secondary='activity_summary_detail_xref',
        load_on_pending=True)

    def __repr__(self):
        return '<ExplorationSurfaceDrilling %r>' % self.activity_summary_id
