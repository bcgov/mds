from datetime import datetime
import re
import uuid

from sqlalchemy import func
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from app.extensions import db
from werkzeug.exceptions import BadRequest

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.parties.party.models.address import Address


class Party(AuditMixin, Base):
    __tablename__ = 'party'
    party_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    first_name = db.Column(db.String, nullable=True)
    middle_name = db.Column(db.String, nullable=True)
    party_name = db.Column(db.String, nullable=False)
    phone_no = db.Column(db.String, nullable=False)
    phone_ext = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=True)
    effective_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    expiry_date = db.Column(db.DateTime)
    party_type_code = db.Column(db.String, db.ForeignKey('party_type_code.party_type_code'))
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    mine_party_appt = db.relationship('MinePartyAppointment', lazy='joined')
    address = db.relationship('Address', lazy='joined')
    job_title = db.Column(db.String, nullable=True)
    postnominal_letters = db.Column(db.String, nullable=True)
    idir_username = db.Column(db.String, nullable=True)

    business_role_appts = db.relationship('PartyBusinessRoleAppointment', lazy='joined')
    party_orgbook_entity = db.relationship(
        'PartyOrgBookEntity', backref='party_orgbook_entity', uselist=False, lazy='select')

    @hybrid_property
    def name(self):
        return self.first_name + ' ' + self.party_name if self.first_name else self.party_name

    @hybrid_property
    def business_roles_codes(self):
        return [
            x.party_business_role_code for x in self.business_role_appts
            if (not x.end_date or x.end_date > datetime.utcnow())
        ]

    @name.expression
    def name(cls):
        return func.concat(cls.first_name, ' ', cls.party_name)

    def __repr__(self):
        return '<Party %r>' % self.party_guid

    # TODO: Remove this once mine_party_appt has been refactored
    def json(self, show_mgr=True, relationships=[]):
        context = {
            'party_guid': str(self.party_guid),
            'party_type_code': self.party_type_code,
            'phone_no': self.phone_no,
            'phone_ext': self.phone_ext,
            'email': self.email,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date is not None else None,
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

    @classmethod
    def find_by_party_guid(cls, _id):
        try:
            uuid.UUID(_id)
        except ValueError:
            raise BadRequest('Invalid Party guid')
        return cls.query.filter_by(party_guid=_id, deleted_ind=False).first()

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
    def create(
        cls,
                                                 # Required fields
        party_name,
        phone_no,
        party_type_code,
                                                 # Optional fields
        address_type_code=None,
                                                 # Nullable fields
        email=None,
        first_name=None,
        phone_ext=None,
        suite_no=None,
        address_line_1=None,
        address_line_2=None,
        city=None,
        sub_division_code=None,
        post_code=None,
        add_to_session=True):
        party = cls(
                                                 # Required fields
            party_name=party_name,
            phone_no=phone_no,
            party_type_code=party_type_code,
                                                 # Optional fields
            email=email,
            first_name=first_name,
            phone_ext=phone_ext)
        if add_to_session:
            party.save(commit=False)
        return party

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
            raise AssertionError('Person first name is not provided.')
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
        if email and not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            raise AssertionError(f'Invalid email format. {email}')
        return email
