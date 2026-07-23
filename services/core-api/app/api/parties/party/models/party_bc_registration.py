from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.utils.include.user_info import User


class PartyBCRegistration(AuditMixin, Base):
    __tablename__ = 'party_orgbook_entity'       #used to be orgbook specific

    #TODO REDESIGN THIS MODEL FOR BC REGISTRIES.....
    # Credential ID is the primary id, but not in new system.

    party_orgbook_entity_id = db.Column(db.Integer, primary_key=True)
    data_source = db.Column(db.String, nullable=False, default="ORGBOOK")

    registration_id = db.Column(db.String, nullable=False) # Business number
    name_text = db.Column(db.String, nullable=False)       # Business name

    # Orgbook sourced data not availble in registries API
    name_id = db.Column(db.Integer, nullable=True)
    credential_id = db.Column(db.Integer, nullable=True)
    company_alias = db.Column(db.String(200), nullable=True)
    registration_date = db.Column(db.DateTime, nullable=True)
    registration_status = db.Column(db.Boolean, nullable=True)

    party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False, unique=True)
    association_user = db.Column(db.String, nullable=False, default=User().get_user_username)
    association_timestamp = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'{self.__class__.__name__} {self.party_orgbook_entity_id}'

    @classmethod
    def find_by_party_guid(cls, party_guid):
        return cls.query.filter_by(party_guid=party_guid).first()

    @classmethod
    def find_by_credential_id(cls, credential_id):
        return cls.query.filter_by(credential_id=credential_id).first()

    @classmethod
    def create(cls,
               party_guid,
               registration_id,
               name_text,
               registration_status=None,
               registration_date=None,
               name_id=None,
               credential_id=None,
               company_alias=None):
        party_orgbook_entity = cls(
            registration_id=registration_id,
            registration_status=registration_status,
            registration_date=registration_date,
            name_id=name_id,
            name_text=name_text,
            credential_id=credential_id,
            party_guid=party_guid,
            company_alias=company_alias)
        party_orgbook_entity.save()
        return party_orgbook_entity

    def delete(self, commit=True):
        super(PartyBCRegistration, self).delete(commit)
