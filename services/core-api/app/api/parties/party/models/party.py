from datetime import datetime
import re

from sqlalchemy import func, case, and_
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.parties.party.models.address import Address

MAX_NAME_LENGTH = 100


class Party(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'party'

    party_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    first_name = db.Column(db.String)
    party_name = db.Column(db.String, nullable=False)
    phone_no = db.Column(db.String)
    phone_ext = db.Column(db.String)
    phone_no_sec = db.Column(db.String)
    phone_sec_ext = db.Column(db.String)
    phone_no_ter = db.Column(db.String)
    phone_ter_ext = db.Column(db.String)
    email = db.Column(db.String)
    email_sec = db.Column(db.String)
    party_type_code = db.Column(db.String, db.ForeignKey('party_type_code.party_type_code'))
    address = db.relationship('Address', lazy='joined')
    job_title = db.Column(db.String)
    postnominal_letters = db.Column(db.String)
    idir_username = db.Column(db.String)
    signature = db.Column(db.String)
    merged_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))

    mine_party_appt = db.relationship(
        'MinePartyAppointment',
        lazy='joined',
        primaryjoin=
        'and_(MinePartyAppointment.party_guid == Party.party_guid, MinePartyAppointment.deleted_ind==False)'
    )

    now_party_appt = db.relationship(
        'NOWPartyAppointment',
        lazy='selectin',
        primaryjoin=
        'and_(NOWPartyAppointment.party_guid == Party.party_guid, NOWPartyAppointment.deleted_ind==False)'
    )

    business_role_appts = db.relationship(
        'PartyBusinessRoleAppointment',
        lazy='dynamic',
        primaryjoin=
        'and_(PartyBusinessRoleAppointment.party_guid == Party.party_guid, PartyBusinessRoleAppointment.deleted_ind==False)'
    )

    party_orgbook_entity = db.relationship(
        'PartyOrgBookEntity', backref='party_orgbook_entity', uselist=False, lazy='select')

    @hybrid_property
    def name(self):
        return f'{self.first_name} {self.party_name}' if self.first_name and self.party_type_code == 'PER' else self.party_name

    @hybrid_property
    def phone(self):
        if (self.phone_no is not None):
            return self.phone_no + (f' x{self.phone_ext}' if self.phone_ext else '')
        else:
            return None

    @hybrid_property
    def phone_sec(self):
        if (self.phone_no_sec is not None):
            return self.phone_no_sec + (f' x{self.phone_sec_ext}' if self.phone_sec_ext else '')
        else:
            return None

    @hybrid_property
    def phone_ter(self):
        if (self.phone_no_ter is not None):
            return self.phone_no_ter + (f' x{self.phone_ter_ext}' if self.phone_ter_ext else '')
        else:
            return None

    @hybrid_property
    def first_address(self):
        return self.address[0] if self.address else None

    @hybrid_property
    def business_roles_codes(self):
        return [
            x.party_business_role_code for x in self.business_role_appts
            if (not x.end_date or x.end_date > datetime.utcnow().date())
        ]

    def __repr__(self):
        return '<Party %r>' % self.party_guid

    # TODO: Remove this once mine_party_appt has been refactored
    def json(self, show_mgr=True, relationships=[]):
        context = {
            'party_guid': str(self.party_guid),
            'party_type_code': self.party_type_code,
            'phone_no': self.phone_no,
            'phone_ext': self.phone_ext,
            'phone_no_sec': self.phone_no_sec,
            'phone_sec_ext': self.phone_sec_ext,
            'phone_no_ter': self.phone_no_ter,
            'phone_ter_ext': self.phone_ter_ext,
            'email': self.email,
            'email_sec': self.email_sec,
            'party_name': self.party_name,
            'name': self.name,
            'address': self.address[0].json() if len(self.address) > 0 else [{}],
            'job_title': self.job_title,
            'postnominal_letters': self.postnominal_letters,
            'idir_username': self.idir_username
        }

        if self.party_type_code == 'PER':
            context.update({
                'first_name': self.first_name,
            })

        if 'mine_party_appt' in relationships:
            context.update({
                'mine_party_appt': [item.json() for item in self.mine_party_appt],
            })

        return context

    @name.expression
    def name(cls):
        return case([
            (and_(cls.first_name != None, cls.party_type_code
                  == 'PER'), f'{cls.first_name} {cls.party_name}'),
        ],
                    else_=cls.party_name)

    @classmethod
    def find_by_party_guid(cls, party_guid):
        return cls.query.filter_by(party_guid=party_guid, deleted_ind=False).one_or_none()

    @classmethod
    def find_by_name(cls, party_name, first_name=None):
        party_type_code = 'PER' if first_name else 'ORG'
        filters = [
            func.lower(cls.party_name) == func.lower(party_name),
            cls.party_type_code == party_type_code, cls.deleted_ind == False
        ]
        if first_name:
            filters.append(func.lower(cls.first_name) == func.lower(first_name))
        return cls.query.filter(*filters).first()

    @classmethod
    def search_by_name(cls, search_term, party_type=None, query_limit=50):
        _filter_by_name = func.upper(cls.name).contains(func.upper(search_term))
        if party_type:
            return cls.query.filter(
                cls.party_type_code == party_type).filter(_filter_by_name).filter(
                    cls.deleted_ind == False).limit(query_limit)
        else:
            return cls.query.filter(_filter_by_name).filter(
                cls.deleted_ind == False).limit(query_limit)

    @classmethod
    def create(cls,
               party_name,
               phone_no,
               party_type_code,
               email=None,
               first_name=None,
               phone_ext=None,
               phone_no_sec=None,
               phone_sec_ext=None,
               phone_no_ter=None,
               phone_ter_ext=None,
               email_sec=None,
               job_title=None,
               add_to_session=True):
        Party.validate_phone_no(phone_no)
        party = cls(
            party_name=party_name,
            phone_no=phone_no,
            party_type_code=party_type_code,
            email=email,
            first_name=first_name if party_type_code == 'PER' else None,
            phone_ext=phone_ext,
            phone_no_sec=phone_no_sec,
            phone_sec_ext=phone_sec_ext,
            phone_no_ter=phone_no_ter,
            phone_ter_ext=phone_ter_ext,
            email_sec=email_sec,
            job_title=job_title)
        if add_to_session:
            party.save(commit=False)
        return party

    @classmethod
    def validate_phone_no(cls, phone_no):
        if not phone_no:
            raise AssertionError('Party phone number is not provided.')
        if not re.match(r'[0-9]{3}-[0-9]{3}-[0-9]{4}', phone_no):
            raise AssertionError('Invalid phone number format, must be of XXX-XXX-XXXX.')
        return phone_no

    @validates('party_type_code')
    def validate_party_type_code(self, key, party_type_code):
        if not party_type_code:
            raise AssertionError('Party type is not provided.')
        if party_type_code not in ['PER', 'ORG']:
            raise AssertionError('Invalid party type.')
        return party_type_code

    @validates('first_name')
    def validate_first_name(self, key, first_name):
        if self.party_type_code == 'PER' and not first_name:
            raise AssertionError('First name is not provided.')
        if self.party_type_code == 'ORG' and first_name:
            raise AssertionError('Organizations cannot have a first name.')
        if first_name and len(first_name) > MAX_NAME_LENGTH:
            raise AssertionError(f'First name must not exceed {MAX_NAME_LENGTH} characters.')
        return first_name

    @validates('party_name')
    def validate_party_name(self, key, party_name):
        if not party_name:
            raise AssertionError('Party name is not provided.')
        if len(party_name) > MAX_NAME_LENGTH:
            raise AssertionError(f'Party name must not exceed {MAX_NAME_LENGTH} characters.')
        return party_name

    @validates('email')
    def validate_email(self, key, email):
        if email and not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            raise AssertionError(f'Invalid email format. {email}')
        return email
