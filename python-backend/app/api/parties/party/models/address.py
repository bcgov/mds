from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates

from ....utils.models_mixins import Base
from app.extensions import db

class Address(Base):
    __tablename__ = "address"
    address_id = db.Column(db.Integer, primary_key=True)
    suite_no = db.Column(db.String, nullable=True)
    address_line_1 = db.Column(db.String, nullable=True)
    address_line_2 = db.Column(db.String, nullable=True)
    city = db.Column(db.String, nullable=True)
    sub_division_code = db.Column(db.String,
                                  # FIXME: Workaround for code-first tests
                                  db.ForeignKey('sub_division_code.sub_division_code', ondelete="cascade"),
                                  nullable=True)
    post_code = db.Column(db.String, nullable=True)
    address_type_code = db.Column(db.String, nullable=False, server_default=FetchedValue())

    party = db.relationship('Party', lazy='joined', secondary='party_address_xref')

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
    def create(
            cls,
            suite_no=None,
            address_line_1=None,
            address_line_2=None,
            city=None,
            sub_division_code=None,
            post_code=None,
            save=True):
        address = cls(
            suite_no=suite_no,
            address_line_1=address_line_1,
            address_line_2=address_line_2,
            city=city,
            sub_division_code=sub_division_code,
            post_code=post_code)
        if save:
            address.save(commit=False)
        return address


    @validates('post_code')
    def validate_post_code(self, key, post_code):
        if post_code and len(post_code) > 6:
            raise AssertionError('post_code must not exceed 6 characters.')
        return post_code
