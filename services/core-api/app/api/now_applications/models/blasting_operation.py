from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase
from app.api.constants import *


class BlastingOperation(Base):
    __tablename__ = "blasting_operation"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), primary_key=True)
    now_application = db.relationship('NOWApplication')

    has_storage_explosive_on_site = db.Column(
        db.Boolean, nullable=False, server_default=FetchedValue())
    explosive_permit_issued = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    explosive_permit_number = db.Column(db.String)
    explosive_permit_expiry_date = db.Column(db.DateTime)

    def __repr__(self):
        return '<BlastingOperation %r>' % self.now_application_id
