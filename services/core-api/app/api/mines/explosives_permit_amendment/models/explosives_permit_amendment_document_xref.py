from app.api.mines.documents.models.mine_document import MineDocument
from app.api.utils.models_mixins import Base, PermitDocumentMixin
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

class ExplosivesPermitAmendmentDocumentXref(PermitDocumentMixin,Base):
    __tablename__ = 'explosives_permit_amendment_document_xref'

    explosives_permit_amendment_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    explosives_permit_amendment_id = db.Column(
        db.Integer, db.ForeignKey('explosives_permit_amendment.explosives_permit_amendment_id'), nullable=False)
    explosives_permit_amendment_document_type_code = db.Column(
        db.String,
        db.ForeignKey('explosives_permit_document_type.explosives_permit_document_type_code'),
        nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.explosives_permit_amendment_document_xref_guid}'

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter_by(mine_document_guid=mine_document_guid).filter(
            MineDocument.deleted_ind == False).one_or_none()
