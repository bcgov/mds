from datetime import datetime
import re
import uuid

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from app.extensions import db

from .party import Party
from ....mines.mine.models.mine import Mine
from ....utils.models_mixins import AuditMixin, Base
from ....constants import PARTY_STATUS_CODE


class MgrAppointment(AuditMixin, Base):
    __tablename__ = "mgr_appointment"
    mgr_appointment_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(
        db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MgrAppoinment %r>' % self.mgr_appointment_guid

    def json(self):
        party = Party.find_by_party_guid(str(self.party_guid))
        mine = Mine.find_by_mine_guid(str(self.mine_guid))
        mine_name = mine.mine_name
        return {
            'mgr_appointment_guid': str(self.mgr_appointment_guid),
            'mine_guid': str(self.mine_guid),
            'mine_name': str(mine_name),
            'party_guid': str(self.party_guid),
            'first_name': party.first_name,
            'party_name': party.party_name,
            'email': party.email,
            'phone_no': party.phone_no,
            'phone_ext': party.phone_ext,
            'name': party.first_name + ' ' + party.party_name,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mgr_appointment_guid(cls, _id):
        return cls.query.filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_party_guid(cls, _id):
        return cls.query.filter_by(party_guid=_id)

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

    @validates('person_guid')
    def validate_party_guid(self, key, party_guid):
        if not party_guid:
            raise AssertionError('Party guid is not provided.')
        return party_guid

    @validates('mine_guid')
    def validate_mine_guid(self, key, mine_guid):
        if not mine_guid:
            raise AssertionError('Mine guid is not provided.')
        return mine_guid

    @validates('effective_date')
    def validate_effective_date(self, key, effective_date):
        if not effective_date:
            raise AssertionError('Effective date is not provided.')
        return effective_date
