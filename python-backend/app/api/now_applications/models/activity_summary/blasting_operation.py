from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class BlastingOperation(ActivitySummaryBase):
    __tablename__ = "blasting_operation"
    __mapper_args__ = {
        'polymorphic_identity': 'blasting_operation',  ## type code
    }

    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    has_storage_explosive_on_site = db.Column(
        db.Boolean, nullable=False, server_default=FetchedValue())
    explosive_permit_issued = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    explosive_permit_number = db.Column(db.String)
    explosive_permit_expiry_date = db.Column(db.DateTime)

    def __repr__(self):
        return '<BlastingOperation %r>' % self.activity_summary_id
