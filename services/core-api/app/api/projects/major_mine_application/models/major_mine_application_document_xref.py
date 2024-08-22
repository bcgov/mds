from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.api.mines.documents.models.mine_document import MineDocument
from app.extensions import db


class MajorMineApplicationDocumentXref(Base):
    __tablename__ = 'major_mine_application_document_xref'

    major_mine_application_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_document.mine_document_guid'),
        nullable=False,
        unique=True)
    major_mine_application_id = db.Column(
        db.Integer,
        db.ForeignKey('major_mine_application.major_mine_application_id'),
        nullable=False)
    major_mine_application_document_type_code = db.Column(
        db.String,
        db.ForeignKey(
            'major_mine_application_document_type.major_mine_application_document_type_code'),
        nullable=False)

    mine_document = db.relationship('MineDocument', lazy='select', overlaps='major_mine_application_document_xref')
    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')
    upload_date = association_proxy('mine_document', 'upload_date')
    create_user = association_proxy('mine_document', 'create_user')
    versions = association_proxy('mine_document', 'versions')
    update_timestamp = association_proxy('mine_document', 'update_timestamp')
    mine_document_bundle = association_proxy('mine_document', 'mine_document_bundle')
    mine_document_bundle_id = association_proxy('mine_document', 'mine_document_bundle_id')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.major_mine_application_document_xref_guid}'

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter_by(mine_document_guid=mine_document_guid).filter(
            MineDocument.deleted_ind == False).one_or_none()
