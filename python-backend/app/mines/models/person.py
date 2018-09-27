from datetime import datetime
import re

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from .mines import MineIdentity
from .mixins import AuditMixin, Base


class Person(AuditMixin, Base):
    __tablename__ = 'person'
    person_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    first_name = db.Column(db.String(60), nullable=False)
    surname = db.Column(db.String(60), nullable=False)
    phone_no = db.Column(db.String(10), nullable=False)
    phone_ext = db.Column(db.String(4), nullable=True)
    email = db.Column(db.String(254), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    mgr_appointment = db.relationship('MgrAppointment', order_by='desc(MgrAppointment.update_timestamp)', backref='person', lazy='joined')

    def __repr__(self):
        return '<Person %r>' % self.person_guid

    def json(self):
        return {
            'person_guid': str(self.person_guid),
            'first_name': self.first_name,
            'surname': self.surname,
            'full_name': self.first_name + ' ' + self.surname,
            'phone_no': self.phone_no,
            'phone_ext': self.phone_ext,
            'email': self.email,
            'mgr_appointment': [item.json() for item in self.mgr_appointment],
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_person_guid(cls, _id):
        return cls.query.filter_by(person_guid=_id).first()

    @classmethod
    def find_by_mgr_appointment(cls, _id):
        return cls.query.join(cls.mgr_appointment, aliased=True).filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.join(cls.mgr_appointment, aliased=True).filter_by(mine_guid=_id).first()

    @classmethod
    def find_by_name(cls, first_name, surname):
        return cls.query.filter(func.lower(cls.first_name) == func.lower(first_name), func.lower(cls.surname) == func.lower(surname)).first()

    @validates('first_name')
    def validate_first_name(self, key, first_name):
        if not first_name:
            raise AssertionError('Person first name is not provided.')
        if len(first_name) > 60:
            raise AssertionError('Person first name must not exceed 60 characters.')
        return first_name

    @validates('surname')
    def validate_surname(self, key, surname):
        if not surname:
            raise AssertionError('Person surname is not provided.')
        if len(surname) > 60:
            raise AssertionError('Person surname must not exceed 60 characters.')
        return surname

    @validates('phone_no')
    def validate_phone_no(self, key, phone_no):
        if not phone_no:
            raise AssertionError('Person phone number is not provided.')
        if not re.match(r'[0-9]{3}-[0-9]{3}-[0-9]{4}', phone_no):
            raise AssertionError('Invalid phone number format, must be of XXX-XXX-XXXX.')
        return phone_no

    @validates('email')
    def validate_email(self, key, email):
        if not email:
            raise AssertionError('Person email is not provided.')
        if not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            raise AssertionError('Invalid email format.')
        return email


class MgrAppointment(AuditMixin, Base):
    __tablename__ = "mgr_appointment"
    mgr_appointment_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    person_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('person.person_guid'), primary_key=True)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MgrAppoinment %r>' % self.mgr_appointment_guid

    def json(self):
        person = Person.find_by_person_guid(str(self.person_guid))
        mine = MineIdentity.find_by_mine_guid(str(self.mine_guid))
        mine_name = mine.mine_detail[0].mine_name
        return {
            'mgr_appointment_guid': str(self.mgr_appointment_guid),
            'mine_guid': str(self.mine_guid),
            'mine_name': mine_name,
            'person_guid': str(self.person_guid),
            'first_name': person.first_name,
            'surname': person.surname,
            'full_name': person.first_name + ' ' + person.surname,
            'email': person.email,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mgr_appointment_guid(cls, _id):
        return cls.query.filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_person_guid(cls, _id):
        return cls.query.filter_by(person_guid=_id)

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

    @validates('person_guid')
    def validate_person_guid(self, key, person_guid):
        if not person_guid:
            raise AssertionError('Person guid is not provided.')
        return person_guid

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
