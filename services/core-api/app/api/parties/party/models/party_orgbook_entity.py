from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class PartyOrgBookEntity(AuditMixin, Base):
    __tablename__ = 'party_orgbook_entity'

    registration_id = db.Column(db.Integer, primary_key=True)
    party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False, unique=True)
    registration_inactive = db.Column(db.Boolean, nullable=False, unique=True)
    name_id = db.Column(db.Integer, nullable=False, unique=True)
    name_text = db.Column(db.String, nullable=False, unique=True)
    name_credential_id = db.Column(db.Integer, nullable=False, unique=True)
    association_timestamp = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<PartyOrgBookEntity %r>' % self.registration_id

    @classmethod
    def create(cls,
               registration_id,
               party_guid,
               registration_inactive,
               name_id,
               name_text,
               name_credential_id,
               add_to_session=True):
        party_orgbook_entity = cls(
            registration_id=registration_id,
            party_guid=party_guid,
            registration_inactive=registration_inactive,
            name_id=name_id,
            name_text=name_text,
            name_credential_id=name_credential_id)
        if add_to_session:
            party_orgbook_entity.save(commit=False)
        return party_orgbook_entity