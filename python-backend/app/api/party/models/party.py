from datetime import datetime
import re

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ...mine.models.mines import MineIdentity
from ...utils.models_mixins import AuditMixin, Base
from ...constants import PARTY_STATUS_CODE


class Party(AuditMixin, Base):
    __tablename__ = 'party'
    party_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    first_name = db.Column(db.String(100), nullable=True)
    middle_name = db.Column(db.String(100), nullable=True)
    party_name = db.Column(db.String(100), nullable=False)
    phone_no = db.Column(db.String(10), nullable=False)
    phone_ext = db.Column(db.String(4), nullable=True)
    email = db.Column(db.String(254), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    mgr_appointment = db.relationship('MgrAppointment', order_by='desc(MgrAppointment.update_timestamp)', backref='person', lazy='joined')
    party_type_code = db.Column(db.String(3), db.ForeignKey('party_type_code.party_type_code'))

    def __repr__(self):
        return '<Party %r>' % self.party_guid

    def json(self, show_mgr=True):
        context = {
            'party_guid': str(self.party_guid),
            'party_type_code': self.party_type_code,
            'phone_no': self.phone_no,
            'phone_ext': self.phone_ext,
            'email': self.email,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat(),
            'party_name': self.party_name
        }
        if self.party_type_code == PARTY_STATUS_CODE['per']:
            context.update({
                'first_name': self.first_name,
                'name': self.first_name + ' ' + self.party_name,
            })
            if show_mgr:
                context.update({'mgr_appointment': [item.json() for item in self.mgr_appointment]})
        elif self.party_type_code == PARTY_STATUS_CODE['org']:
            context.update({'name': self.party_name})
        return context

    @classmethod
    def find_by_party_guid(cls, _id):
        return cls.query.filter_by(party_guid=_id).first()

    @classmethod
    def find_by_mgr_appointment(cls, _id):
        return cls.query.join(cls.mgr_appointment, aliased=True).filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.join(cls.mgr_appointment, aliased=True).filter_by(mine_guid=_id).first()

    @classmethod
    def find_by_party_name(cls, party_name):
        return cls.query.filter(func.lower(cls.party_name) == func.lower(party_name), cls.party_type_code == PARTY_STATUS_CODE['org']).first()

    @classmethod
    def find_by_name(cls, first_name, party_name):
        return cls.query.filter(func.lower(cls.first_name) == func.lower(first_name), func.lower(cls.party_name) == func.lower(party_name), cls.party_type_code == PARTY_STATUS_CODE['per']).first()

    @validates('first_name')
    def validate_first_name(self, key, first_name):
        if first_name and len(first_name) > 100:
            raise AssertionError('Person first name must not exceed 100 characters.')
        return first_name

    @validates('party_name')
    def validate_party_name(self, key, party_name):
        if not party_name:
            raise AssertionError('Party name is not provided.')
        if len(party_name) > 100:
            raise AssertionError('Party name must not exceed 100 characters.')
        return party_name

    @validates('phone_no')
    def validate_phone_no(self, key, phone_no):
        if not phone_no:
            raise AssertionError('Party phone number is not provided.')
        if not re.match(r'[0-9]{3}-[0-9]{3}-[0-9]{4}', phone_no):
            raise AssertionError('Invalid phone number format, must be of XXX-XXX-XXXX.')
        return phone_no

    @validates('email')
    def validate_email(self, key, email):
        if not email:
            raise AssertionError('Party email is not provided.')
        if not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            raise AssertionError('Invalid email format.')
        return email


class PartyTypeCode(AuditMixin, Base):
    __tablename__ = 'party_type_code'
    party_type_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<Permit %r>' % self.party_type_code

    def json(self):
        return {
            'party_type_code': self.party_type_code,
            'description': self.description,
            'display_order': str(self.display_order)
        }

    @classmethod
    def find_by_party_type_code(cls, _id):
        return cls.query.filter_by(party_type_code=_id).first()

    @validates('party_type_code')
    def validate_party_type_code(self, key, party_type_code):
        if not party_type_code:
            raise AssertionError('Party type code is not provided.')
        if len(party_type_code) > 3:
            raise AssertionError('Party type code must not exceed 3 characters.')
        return party_type_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Party type description is not provided.')
        if len(description) > 100:
            raise AssertionError('Party type description must not exceed 100 characters.')
        return description


class MgrAppointment(AuditMixin, Base):
    __tablename__ = "mgr_appointment"
    mgr_appointment_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MgrAppoinment %r>' % self.mgr_appointment_guid

    def json(self):
        party = Party.find_by_party_guid(str(self.party_guid))
        mine = MineIdentity.find_by_mine_guid(str(self.mine_guid))
        mine_name = mine.mine_detail[0].mine_name
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
