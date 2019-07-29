import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class MineIncidentFollowupInvestigationType(AuditMixin, Base):
    __tablename__ = 'mine_incident_followup_investigation_type'
    mine_incident_followup_investigation_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).order_by(cls.display_order).all()
