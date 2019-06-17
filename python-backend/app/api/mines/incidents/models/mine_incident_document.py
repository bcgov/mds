from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base

from app.extensions import db


class MineIncidentDocument(AuditMixin, Base):
    __tablename__ = "mine_incident_document"
    mine_incident_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), nullable=True)
    mine_incident_document_type_code = db.Column(
        db.String,
        db.ForeignKey('mine_incident_document_type_code.mine_incident_document_type_code'),
        nullable=False)
    document_name = db.Column(db.String, nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    mine_incident = db.relationship('MineIncident', backref='documents', lazy='joined')

    @classmethod
    def find_by_mine_incident_document_guid(cls, _guid):
        return cls.query.filter_by(mine_incident_document_guid=_guid).first()