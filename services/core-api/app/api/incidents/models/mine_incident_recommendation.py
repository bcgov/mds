import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base

INVALID_MINE_INCIDENT_RECOMMENDATION_GUID = 'Invalid mine_incident_recommendation_guid.'

class MineIncidentRecommendation(AuditMixin, Base):
    __tablename__ = 'mine_incident_recommendation'
    mine_incident_recommendation_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), nullable=False)
    recommendation = db.Column(db.String, nullable=False)
    mine_incident_recommendation_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())


    @classmethod
    def create(cls, recommendation, mine_incident_id, add_to_session=True):
        new_recommendation = cls(recommendation=recommendation, mine_incident_id=mine_incident_id)
        if add_to_session:
            new_recommendation.save(commit=False)
        return new_recommendation


    @classmethod
    def find_by_mine_incident_recommendation_guid(cls, _id):
        try:
            uuid.UUID(str(_id), version=4)
            return cls.query.filter_by(mine_incident_recommendation_guid=_id).filter_by(deleted_ind=False).first()
        except ValueError:
            raise AssertionError(INVALID_MINE_INCIDENT_RECOMMENDATION_GUID)
