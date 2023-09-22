
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class PartyVerifiableCredentialMinesActPermit(AuditMixin, Base):
    """Verificable Credential reference to Traction, a Multi-tenant Hyperledger Aries Wallet"""
    __tablename__ = "party_verifiable_credential_mines_act_permit"
    cred_exch_id = db.Column(db.String, primary_key=True)
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    permit_amendment_id = db.Column(UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_id'), nullable=False)

    def __repr__(self):
        return '<PartyVerifiableCredentialMinesActPermit cred_exch_id=%r, party_guid=%r, permit_amendment_id=%r>' % self.cred_exch_id, self.party_guid, self.permit_amendment_id
        
    @classmethod
    def find_by_cred_exch_id(cls, cred_exch_id) -> "PartyVerifiableCredentialMinesActPermit":
        return cls.query.filter_by(cred_exch_id=cred_exch_id).one_or_none()

    @classmethod
    def find_by_party_guid(cls, party_guid) -> "PartyVerifiableCredentialMinesActPermit":
        return cls.query.filter_by(party_guid=party_guid).all()