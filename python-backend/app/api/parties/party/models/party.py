from datetime import datetime
import re
import uuid

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from ....constants import PARTY_STATUS_CODE


class Party(AuditMixin, Base):
    __tablename__ = 'party'
    party_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    first_name = db.Column(db.String, nullable=True)
    middle_name = db.Column(db.String, nullable=True)
    party_name = db.Column(db.String, nullable=False)
    phone_no = db.Column(db.String, nullable=False)
    phone_ext = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    party_type_code = db.Column(db.String, db.ForeignKey('party_type_code.party_type_code'))

    suite_no = db.Column(db.String, nullable=True)
    address_line_1 = db.Column(db.String, nullable=True)
    address_line_2 = db.Column(db.String, nullable=True)
    city = db.Column(db.String, nullable=True)
    province_code = db.Column(db.String, nullable=True)
    postal_code = db.Column(db.String, nullable=True)

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
            'name': self.name,
            'address': [
                {
                    'suite_no': self.suite_no,
                    'address_line_1': self.address_line_1,
                    'address_line_2': self.address_line_2,
                    'city': self.city,
                    'province_code': self.province_code,
                    'postal_code': self.postal_code
                }
            ]
        }
        if self.party_type_code == PARTY_STATUS_CODE['per']:
            context.update({
                'first_name': self.first_name,
            })
        return context

    @classmethod
    def find_by_party_guid(cls, _id):
        return cls.query.filter_by(party_guid=_id).first()

    @classmethod
    def find_by_name(cls, party_name, first_name=None):
        party_type_code = 'PER' if first_name else 'ORG'
        filters = [
            func.lower(cls.party_name) == func.lower(party_name),
            cls.party_type_code == party_type_code
        ]
        if first_name:
            filters.append(func.lower(cls.first_name) == func.lower(first_name))
        return cls.query.filter(*filters).first()

    @classmethod
    def search_by_name(cls, search_term, party_type=None, query_limit=50):
        _filter_by_name = func.upper(cls.name).contains(func.upper(search_term))
        if party_type:
            return cls.query.filter(
                cls.party_type_code == party_type).filter(_filter_by_name).limit(query_limit)
        else:
            return cls.query.filter(_filter_by_name).limit(query_limit)

    @classmethod
    def create(cls,
               # Required fields
               party_name,
               email,
               phone_no,
               party_type_code,
               user_kwargs,
               # Nullable fields
               first_name=None,
               phone_ext=None,
               suite_no=None,
               address_line_1=None,
               address_line_2=None,
               city=None,
               province_code=None,
               postal_code=None,
               save=True):
        party = cls(
            # Required fields
            party_guid=uuid.uuid4(),
            party_name=party_name,
            email=email,
            phone_no=phone_no,
            party_type_code=party_type_code,
            **user_kwargs,
            # Optional fields
            first_name=first_name,
            phone_ext=phone_ext,
            suite_no=suite_no,
            address_line_1=address_line_1,
            address_line_2=address_line_2,
            city=city,
            province_code=province_code,
            postal_code=postal_code)
        if save:
            party.save(commit=False)
        return party


    def validate_unique_name(self, party_name, first_name=None):
        if Party.find_by_name(party_name, first_name):
            if first_name:
                name = first_name + ' ' + party_name
            else:
                name = party_name
            raise AssertionError(
                'Party with the name: {} already exists'.format(name))
        return party_name

    @validates('party_type_code')
    def validate_email(self, key, party_type_code):
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
        if self.party_name:
            self.validate_unique_name(self.party_name, first_name)
        return first_name

    @validates('party_name')
    def validate_party_name(self, key, party_name):
        if not party_name:
            raise AssertionError('Party name is not provided.')
        if len(party_name) > 100:
            raise AssertionError('Party name must not exceed 100 characters.')
        if self.first_name:
            self.validate_unique_name(party_name, self.first_name)
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
