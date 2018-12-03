from datetime import datetime
import re
import uuid

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ...party.models.party import Party
from ....utils.models_mixins import AuditMixin, Base


class MinePartyAppointment(AuditMixin, Base):
    __tablename__ = "mine_party_appt"
    #Columns
    mine_party_appt_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_party_appt_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_guid =  db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_party_appt_type_code = db.Column(db.String(3), db.ForeignKey('mine_party_appt_type_code.mine_party_appt_type_code'))
    effective_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    expiry_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    #Relationships
    party = db.relationship('Party',backref='party', lazy='joined')
    mine_part_appt_type = db.relationship('MinePartyAppointmentType', backref='mine_party_appt', order_by='desc(MinePartyAppointmentType.display_order)', lazy='joined')

    def json(self):
        return {
            'mine_party_appt_guid' : str(self.mine_party_appt_guid),
            'mine_guid': str(self.mine_guid),
            'party_guid': str(self.party_guid),
            'mine_party_appt_type_code': str(self.mine_party_appt_type_code),    
            'effective_date': [item.json() for item in self.effective_date],
            'expiry_date': [item.json() for item in self.expiry_date],
        }

    @classmethod
    def find_by_mine_party_appt_guid(cls, _id):
        try:
            return cls.query.filter_by(mine_party_appt_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_guid=_id).all()
        except ValueError:
            return None

    @classmethod
    def find_by_party_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(party_guid=_id).all()
        except ValueError:
            return None
    
    @classmethod
    def find_parties_by_mine_party_appt_type_code(cls, code):
        try:
            return cls.query(cls.party_guid).filter_by(mine_party_appt_type_code=code).all()
        except ValueError:
            return None