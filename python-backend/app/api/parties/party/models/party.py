from datetime import datetime
import re
import uuid

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from app.extensions import db

from ....mines.mine.models.mine_identity import MineIdentity
from ....utils.models_mixins import AuditMixin, Base
from ....constants import PARTY_STATUS_CODE


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


    @hybrid_property
    def name(self):
        return self.first_name + ' ' + self.party_name if self.first_name else self.party_name

    @name.expression
    def name(cls):
        return func.concat(cls.first_name, ' ', cls.party_name)

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
            'party_name': self.party_name,
            'name': self.name
        }
        if self.party_type_code == PARTY_STATUS_CODE['per']:
            context.update({
                'first_name': self.first_name,
            })
            if show_mgr:
                context.update({'mgr_appointment': [item.json() for item in self.mgr_appointment]})
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

    @classmethod
    def search_by_name(cls, search_term, party_type=None):
        _filter_by_name = func.upper(cls.name).contains(func.upper(search_term))
        if party_type:
            return cls.query.filter(cls.party_type_code==party_type).filter(_filter_by_name)
        else:
            return cls.query.filter(_filter_by_name)

    @classmethod
    def create_party(cls, generated_first_name, generated_last_name, user_kwargs, save=True):
        party = cls(
            party_guid=uuid.uuid4(),
            first_name=generated_first_name,
            party_name=generated_last_name,
            email=generated_first_name.lower() + '.' + generated_last_name.lower() + '@' + generated_last_name.lower() + '.com',
            phone_no='123-123-1234',
            party_type_code=PARTY_STATUS_CODE['per'],
            **user_kwargs
        )
        if save:
            party.save(commit=False)
        return party

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
