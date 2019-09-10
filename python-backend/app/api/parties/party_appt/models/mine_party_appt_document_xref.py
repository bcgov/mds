from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MinePartyApptDocumentXref(Base):
    __tablename__ = "mine_party_appt_document_xref"
    mine_party_appt_document_xref_guid = db.Column(UUID(as_uuid=True),
                                            primary_key=True,
                                            server_default=FetchedValue())
    mine_document_guid = db.Column(UUID(as_uuid=True),
                                   db.ForeignKey('mine_document.mine_document_guid'))
    mine_party_appt_id = db.Column(db.Integer,
                            db.ForeignKey('mine_party_appt.mine_party_appt_id'),
                            server_default=FetchedValue())

    def __repr__(self):
        return '<MinePartyApptDocumentXref %r>' % self.mine_party_appt_document_xref_guid
