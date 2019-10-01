from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base
from app.extensions import db

class PartyAddressXref(Base):
    __tablename__ = "party_address_xref"
    party_guid = db.Column(UUID(as_uuid=True),
                           db.ForeignKey('party.party_guid'),
                           primary_key=True)
    address_id = db.Column(UUID(as_uuid=True),
                           db.ForeignKey('address.address_id'),
                           primary_key=True)

    def __repr__(self):
        return '<PartyAddressXref %r>' % self.party_guid
