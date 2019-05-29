from datetime import datetime
import re
import uuid
import requests

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.parties.party_appt.models.party_business_role_code import PartyBusinessRoleCode
from app.api.parties.party.models.party import Party
from ....utils.models_mixins import AuditMixin, Base


class PartyBusinessRoleAppt(AuditMixin, Base):
    __tablename__ = "party_business_role_appt"
    # Columns
    party_business_role_appt_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    party_business_role_code = db.Column(
        db.String(32), db.ForeignKey('party_business_role_code.party_business_role_code'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    active_ind = db.Column(db.String(60), server_default=FetchedValue())

    # Relationships
    party = db.relationship('Party', lazy='joined')

    party_business_role = db.relationship(
        'PartyBusinessRoleCode', backref='part_business_role_appt', lazy='joined')
