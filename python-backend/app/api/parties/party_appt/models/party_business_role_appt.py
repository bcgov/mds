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

     @classmethod
    def find_by_business_role_appt_id(cls, _id):
        try:
            return cls.query.filter_by(party_business_role_appt_id=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_party_guid(cls, _id):
        try:
            return cls.find_by(party_guid=_id)
        except ValueError:
            return None

    @classmethod
    def find_parties_by_business_role_code(cls, code):
        try:
            return cls.find_by(party_business_role_code=[code])
        except ValueError:
            return None
    
    @classmethod
    def create(cls,
               party_business_role_code,
               party_guid,
               started_at=None,
               ended_at=None,
               add_to_session=True):
        party_business_role_appt = cls(
            party_business_role_code=party_business_role_code,
            party_guid=party_guid,
            started_at=started_at,
            ended_at=ended_at)
        if add_to_session:
            party_business_role_appt.save(commit=False)
        return party_business_role_appt