import re
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class Address(Base, AuditMixin):
    __tablename__ = "address"
    address_id = db.Column(db.Integer, primary_key=True)
    suite_no = db.Column(db.String, nullable=True)
    address_line_1 = db.Column(db.String, nullable=True)
    address_line_2 = db.Column(db.String, nullable=True)
    city = db.Column(db.String, nullable=True)
    sub_division_code = db.Column(db.String,
                                  db.ForeignKey('sub_division_code.sub_division_code'),
                                  nullable=True)
    post_code = db.Column(db.String, nullable=True)
    address_type_code = db.Column(db.String, nullable=False, server_default=FetchedValue())

    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    party = db.relationship('Party', lazy='joined')

    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<Address %r>' % self.address_id

    # TODO: Remove this once mine_party_appt has been refactored
    def json(self):
        return {
            'suite_no': self.suite_no,
            'address_line_1': self.address_line_1,
            'address_line_2': self.address_line_2,
            'city': self.city,
            'sub_division_code': self.sub_division_code,
            'post_code': self.post_code
        }

    @classmethod
    def create(cls,
               suite_no=None,
               address_line_1=None,
               address_line_2=None,
               city=None,
               sub_division_code=None,
               post_code=None,
               add_to_session=True):
        address = cls(suite_no=suite_no,
                      address_line_1=address_line_1,
                      address_line_2=address_line_2,
                      city=city,
                      sub_division_code=sub_division_code,
                      post_code=post_code)
        if add_to_session:
            address.save(commit=False)
        return address

    @validates('post_code')
    def validate_post_code(self, key, post_code):
        if post_code and len(post_code) > 6:
            raise AssertionError('post_code must not exceed 6 characters.')
        validPostalCode = re.compile(r"\s*([a-zA-Z]\s*\d\s*){3}$")
        if post_code and not validPostalCode.match(post_code):
            raise AssertionError('Invalid post_code format.')
        return post_code
