from sqlalchemy.orm import validates
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


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

    @classmethod
    def create_party_type_code(cls, code, description, display_order, add_to_session=True):
        party_type_code = cls(
            party_type_code=code,
            description=description,
            display_order=display_order,
        )
        if add_to_session:
            party_type_code.save(commit=False)
        return party_type_code

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
