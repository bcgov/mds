
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class MineVerifiableCredentialConnection(AuditMixin, Base):
    """Verificable Credential reference to Traction, a Multi-tenant Hyperledger Aries Wallet"""
    __tablename__ = "mine_verifiable_credential_connection"
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), primary_key=True)

    connection_id = db.Column(db.String)
    connection_state = db.Column(db.String, server_default=FetchedValue()) 
    #ARIES-RFC 0023 https://github.com/hyperledger/aries-rfcs/tree/main/features/0023-did-exchange

    invitation_id = db.Column(db.String)
    
    def __repr__(self):
        return '<MineVerifiableCredentialConnection mine_guid=%r, connection_state=%r>' % self.mine_guid, self.connection_state or "UNKNOWN"

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()
        