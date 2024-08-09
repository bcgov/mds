from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.api.mines.documents.models.mine_document import MineDocument
from app.extensions import db


class ProjectDecisionPackageDocumentXref(Base):
    __tablename__ = 'project_decision_package_document_xref'

    project_decision_package_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_document.mine_document_guid'),
        nullable=False,
        unique=True)
    project_decision_package_id = db.Column(
        db.Integer,
        db.ForeignKey('project_decision_package.project_decision_package_id'),
        nullable=False)
    project_decision_package_document_type_code = db.Column(
        db.String,
        db.ForeignKey(
            'project_decision_package_document_type.project_decision_package_document_type_code'),
        nullable=False)

    mine_document = db.relationship('MineDocument', lazy='select', overlaps="project_decision_package_document_xref")
    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')
    update_timestamp = association_proxy('mine_document', 'update_timestamp')
    upload_date = association_proxy('mine_document', 'upload_date')
    create_user = association_proxy('mine_document', 'create_user')
    versions = association_proxy('mine_document', 'versions')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_decision_package_document_xref_guid}'

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter_by(mine_document_guid=mine_document_guid).filter(
            MineDocument.deleted_ind == False).one_or_none()
