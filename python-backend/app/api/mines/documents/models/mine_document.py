import uuid

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class MineDocument(AuditMixin, Base):
    __tablename__ = 'mine_document'
    mine_document_guid = db.Column(UUID(as_uuid=True),
                                   primary_key=True,
                                   server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    document_manager_guid = db.Column(UUID(as_uuid=True))
    document_name = db.Column(db.String(40), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    mine_name = association_proxy('mine', 'mine_name')

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).filter_by(active_ind=True).all()

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter_by(mine_document_guid=mine_document_guid).filter_by(
            active_ind=True).first()

    # TODO: Remove when mine_party_appt is refactored
    def json(self):
        return {
            'mine_document_guid': str(self.mine_document_guid),
            'mine_guid': str(self.mine_guid),
            'document_manager_guid': str(self.document_manager_guid),
            'document_name': self.document_name
        }
