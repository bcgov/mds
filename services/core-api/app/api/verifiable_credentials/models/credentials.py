
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from typing import List
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
class PartyVerifiableCredentialMinesActPermit(AuditMixin, Base):
    """Verificable Credential reference to Traction, a Multi-tenant Hyperledger Aries Wallet"""
    __tablename__ = "party_verifiable_credential_mines_act_permit"
    cred_exch_id = db.Column(db.String, primary_key=True)
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    permit_amendment_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_guid'), nullable=False)
    cred_exch_state = db.Column(db.String, nullable=True)
    cred_type = db.Column(db.String, nullable=True) #anoncred schema or json-ld url
    rev_reg_id = db.Column(db.String, nullable=True)
    cred_rev_id = db.Column(db.String, nullable=True)
    last_webhook_timestamp = db.Column(db.DateTime, nullable=True)
    error_description = db.Column(db.String, nullable=True)

    permit_amendment = db.relationship('PermitAmendment', lazy='select', uselist=False, overlaps='vc_credential_exch')
    party = db.relationship('Party', lazy='select')
    
    
    _active_credential_states = ["credential_issued","credential_acked", "done"]
    _pending_credential_states = ["offer_sent","request_received"]

    def __repr__(self):
        return f'<PartyVerifiableCredentialMinesActPermit cred_exch_id={self.cred_exch_id}, party_guid={self.party_guid}, permit_amendment_id={self.permit_amendment_guid}>'
        
    @classmethod
    def find_by_cred_exch_id(cls, cred_exch_id, unsafe:bool =False) -> "PartyVerifiableCredentialMinesActPermit":
        query = cls.query.unbound_unsafe() if unsafe else cls.query
        return query.filter_by(cred_exch_id=cred_exch_id).one_or_none()

    @classmethod
    def find_by_party_guid(cls, party_guid) -> List["PartyVerifiableCredentialMinesActPermit"]:
        return cls.query.filter_by(party_guid=party_guid).all()
    
    @classmethod
    def find_by_permit_amendment_guid(cls, permit_amendment_guid) -> List["PartyVerifiableCredentialMinesActPermit"]:
        return cls.query.filter_by(permit_amendment_guid=permit_amendment_guid).all()

    @classmethod
    def find_issued_by_permit_amendment_guid(cls, permit_amendment_guid) -> List["PartyVerifiableCredentialMinesActPermit"]:
        #https://github.com/hyperledger/aries-rfcs/blob/main/features/0036-issue-credential/README.md#states-for-issuer
        return cls.query.filter_by(permit_amendment_guid=permit_amendment_guid).filter(PartyVerifiableCredentialMinesActPermit.cred_exch_state.in_(cls._active_credential_states)).all()
    
    @classmethod
    def find_by_permit_guid_and_mine_guid(cls, permit_guid, mine_guid) -> List["PartyVerifiableCredentialMinesActPermit"]:
        return cls.query.join(PermitAmendment).join(Permit).filter(PermitAmendment.permit_guid==Permit.permit_guid).filter(PermitAmendment.mine_guid==mine_guid).all()
