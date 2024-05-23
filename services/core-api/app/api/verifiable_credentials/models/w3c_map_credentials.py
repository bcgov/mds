
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from typing import List
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment

class UNTPCCredential():
    pass


class PartyVerifiableCredentialW3CCredential(AuditMixin, Base):
    """Verificable Credential"""
    __tablename__ = "party_verifiable_credential_w3c_credential"
    cred_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    cred_type = db.Column(db.String, nullable=False) # Schema.org type? or some other vocab?
    permit_amendment_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_guid'), nullable=False)
    credential = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)

    def __repr__(self):
        return f'<PartyVerifiableCredentialW3CCredential cred_guid={self.cred_guid}, ermit_amendment_id={self.permit_amendment_guid}>'
        
    @classmethod
    def find_by_cred_guid(cls, cred_guid, unsafe:bool =False) -> "PartyVerifiableCredentialW3CCredential":
        query = cls.query.unbound_unsafe() if unsafe else cls.query
        return query.filter_by(cred_guid=cred_guid).one_or_none()
