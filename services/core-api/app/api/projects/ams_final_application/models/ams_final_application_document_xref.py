from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import SoftDeleteMixin, Base
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.ams_final_application.models.ams_final_application_document_type import AmsFinalApplicationDocumentType
from app.extensions import db

class AmsFinalApplicationDocumentXref(SoftDeleteMixin, Base):
    __tablename__ = "ams_final_application_document_xref"

    ams_final_application_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    ams_final_application_guid = db.Column(
        UUID(as_uuid=True), 
        db.ForeignKey('ams_final_application.ams_final_application_guid'),
        nullable=False
    )
    ams_final_application_document_type_code = db.Column(
        db.String,
        db.ForeignKey('ams_final_application_document_type.ams_final_application_document_type_code'),
        nullable=False
    )
    mine_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_document.mine_document_guid'),
        nullable=False,
        unique=True)

    mine_document = db.relationship(MineDocument, lazy='select', overlaps="project_summary_document_xref")
    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_type = db.relationship(AmsFinalApplicationDocumentType, lazy='select')
    document_type_description = association_proxy('document_type', 'description')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')
    create_user = association_proxy('mine_document', 'create_user')

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter_by(mine_document_guid=mine_document_guid).filter(
            MineDocument.deleted_ind == False).one_or_none()