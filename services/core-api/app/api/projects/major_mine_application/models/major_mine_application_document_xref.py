from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, DocumentXrefMixin
from app.extensions import db

class MajorMineApplicationDocumentXref(Base, DocumentXrefMixin):
    __tablename__ = 'major_mine_application_document_xref'

    major_mine_application_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    major_mine_application_id = db.Column(
        db.Integer,
        db.ForeignKey('major_mine_application.major_mine_application_id'),
        nullable=False)
    major_mine_application_document_type_code = db.Column(
        db.String,
        db.ForeignKey(
            'major_mine_application_document_type.major_mine_application_document_type_code'),
        nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.major_mine_application_document_xref_guid}'