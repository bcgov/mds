from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.declarative import declared_attr

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from app.api.now_applications.models.activity_detail import ActivityDetail
from app.api.now_applications.models.activity_type import ActivityType

from app.api.now_applications.models.unit_type import UnitType


class ActivitySummaryBase(AuditMixin, Base):
    __tablename__ = "activity_summary"

    activity_summary_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())

    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    now_application = db.relationship('NOWApplication')

    activity_summary_type_code = db.Column(
        db.String, db.ForeignKey('activity_summary_type.activity_summary_type_code'))

    reclamation_description = db.Column(db.String)
    reclamation_cost = db.Column(db.Numeric(10, 2))
    total_disturbed_area = db.Column(db.Numeric(14, 2))
    total_disturbed_area_unit_type_code = db.Column(db.String,
                                                    db.ForeignKey('unit_type.unit_type_code'))

    activity_details = db.relationship('ActivityDetail')

    __mapper_args__ = {'polymorphic_on': activity_summary_type_code}
