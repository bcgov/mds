
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class PartyVerifiableCredentialConnection(AuditMixin, Base):
    """Verificable Credential reference to Traction, a Multi-tenant Hyperledger Aries Wallet"""
    __tablename__ = "party_verifiable_credential_connection"
    invitation_id = db.Column(db.String, primary_key=True)

    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)

    connection_id = db.Column(db.String)
    connection_state = db.Column(db.String, server_default=FetchedValue()) 
    #ARIES-RFC 0023 https://github.com/hyperledger/aries-rfcs/tree/main/features/0023-did-exchange

    
    def __repr__(self):
        return '<MineVerifiableCredentialConnection party_guid=%r, connection_state=%r>' % self.party_guid, self.connection_state or "UNKNOWN"

    @classmethod
    def find_by_party_guid(cls, party_guid) -> "PartyVerifiableCredentialConnection":
        return cls.query.filter_by(mine_guid=party_guid).all()
        