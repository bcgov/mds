import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class SurfaceBulkSample(ActivitySummaryBase):
    __tablename__ = 'surface_bulk_sample'
    __mapper_args__ = {
        'polymorphic_identity': 'surface_bulk_sample',
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    processing_method_description = db.Column(db.String, nullable=False)
    handling_instructions = db.Column(db.String)
    drainage_mitigation_description = db.Column(db.String)

    has_bedrock_excavation = db.Column(db.Boolean)

    details = db.relationship(
        'SurfaceBulkSampleDetail', secondary='activity_summary_detail_xref', load_on_pending=True, overlaps='detail,detail_associations,summary,summary_associations')

    @hybrid_property
    def calculated_total_disturbance(self):
        return self.calculate_total_disturbance_area(self.details)

    def __repr__(self):
        return '<SurfaceBulkSurface %r>' % self.activity_summary_id