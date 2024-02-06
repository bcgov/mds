from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class ExplorationAccess(ActivitySummaryBase):
    __tablename__ = "exploration_access"
    __mapper_args__ = {
        'polymorphic_identity': 'exploration_access', ## type code
    }

    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)
    has_proposed_bridges_or_culverts = db.Column(db.Boolean, nullable=False, default=False)
    bridge_culvert_crossing_description = db.Column(db.String)

    details = db.relationship(
        'ExplorationAccessDetail', secondary='activity_summary_detail_xref', load_on_pending=True, overlaps='detail,detail_associations,summary,summary_associations')

    @hybrid_property
    def calculated_total_disturbance(self):
        return self.calculate_total_disturbance_area(self.details)

    def __repr__(self):
        return '<ExplorationAccess %r>' % self.activity_summary_id
