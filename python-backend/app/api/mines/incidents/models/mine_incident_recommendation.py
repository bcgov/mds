import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from ....utils.models_mixins import AuditMixin, Base


class MineIncidentRecommendation(AuditMixin, Base):
    __tablename__ = 'mine_incident_recommendation'
    mine_incident_recommendation_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), nullable=False)
    recommendation = db.Column(db.String, nullable=False)
