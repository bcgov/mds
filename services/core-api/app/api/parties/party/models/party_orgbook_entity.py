from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.utils.include.user_info import User


class PartyOrgBookEntity(AuditMixin, Base):
    __tablename__ = 'party_orgbook_entity'

    party_orgbook_entity_id = db.Column(db.Integer, primary_key=True)
    registration_id = db.Column(db.String, nullable=False, unique=True)
    registration_status = db.Column(db.Boolean, nullable=False)
    registration_date = db.Column(db.DateTime, nullable=False)
    name_id = db.Column(db.Integer, nullable=False, unique=True)
    name_text = db.Column(db.String, nullable=False, unique=True)
    credential_id = db.Column(db.Integer, nullable=False, unique=True)

    party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False, unique=True)
    association_user = db.Column(db.DateTime, nullable=False, default=User().get_user_username)
    association_timestamp = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<PartyOrgBookEntity %r>' % self.party_orgbook_entity_id

    @classmethod
    def find_by_party_guid(cls, party_guid):
        return cls.query.filter_by(party_guid=party_guid).first()

    @classmethod
    def find_by_credential_id(cls, credential_id):
        return cls.query.filter_by(credential_id=credential_id).first()

    @classmethod
    def create(cls, registration_id, registration_status, registration_date, name_id, name_text,
               credential_id, party_guid):
        party_orgbook_entity = cls(
            registration_id=registration_id,
            registration_status=registration_status,
            registration_date=registration_date,
            name_id=name_id,
            name_text=name_text,
            credential_id=credential_id,
            party_guid=party_guid)
        party_orgbook_entity.save()
        return party_orgbook_entity