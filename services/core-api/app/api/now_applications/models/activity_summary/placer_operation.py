import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class PlacerOperation(ActivitySummaryBase):
    __tablename__ = 'placer_operation'
    __mapper_args__ = {
        'polymorphic_identity': 'placer_operation', ## type code
    }
    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    is_underground = db.Column(db.Boolean)
    is_hand_operation = db.Column(db.Boolean)
    has_stream_diversion = db.Column(db.Boolean)
    reclamation_area = db.Column((db.Numeric(14, 2)))
    reclamation_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'), nullable=False)
    proposed_production = db.Column(db.String)
    proposed_production_unit_type_code = db.Column(db.String,
                                                   db.ForeignKey('unit_type.unit_type_code'))

    details = db.relationship(
        'PlacerOperationDetail', secondary='activity_summary_detail_xref', load_on_pending=True, overlaps='detail,detail_associations,summary,summary_associations')

    @hybrid_property
    def calculated_total_disturbance(self):
        return self.calculate_total_disturbance_area(self.details)

    def __repr__(self):
        return '<PlacerOperation %r>' % self.activity_summary_id