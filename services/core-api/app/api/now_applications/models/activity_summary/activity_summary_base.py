from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.constants import NOW_APPLICATION_EDIT_GROUP


class ActivitySummaryBase(AuditMixin, Base):
    __tablename__ = 'activity_summary'

    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    activity_summary_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())

    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    now_application = db.relationship('NOWApplication')

    activity_type_code = db.Column(db.String, db.ForeignKey('activity_type.activity_type_code'))

    reclamation_description = db.Column(db.String)
    reclamation_cost = db.Column(db.Numeric)
    total_disturbed_area = db.Column(db.Numeric)
    total_disturbed_area_unit_type_code = db.Column(db.String,
                                                    db.ForeignKey('unit_type.unit_type_code'))

    equipment = db.relationship(
        'Equipment', secondary='activity_equipment_xref', load_on_pending=True)

    __mapper_args__ = {'polymorphic_on': activity_type_code}

    @classmethod
    def calculate_total_disturbance_area(cls, details):
        if details:
            total = sum(item.disturbed_area if item.disturbed_area else 0 for item in details)
            return total if total else 0
        return None
