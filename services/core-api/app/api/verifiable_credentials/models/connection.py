
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class MineVerifiableCredentialConnection(AuditMixin, Base):
    """Verificable Credential reference to Traction, a Multi-tenant Hyperledger Aries Wallet"""
    __tablename__ = "mine_verifiable_credential_connection"
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), primary_key=True)

    connection_id = db.Column(db.String, nullable=False)
    connection_state = db.Column(db.String, nullable=False, server_default=FetchedValue()) 
    #ARIES-RFC 0023 https://github.com/hyperledger/aries-rfcs/tree/main/features/0023-did-exchange
    
    def __repr__(self):
        return '<VarianceDocumentCategoryCode %r>' % self.variance_document_category_code

    @classmethod
    def get_all(cls):
        return cls.query.all()