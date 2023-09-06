from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.projects.project.models.project import Project
from app.api.projects.project_decision_package.models.project_decision_package_document_xref import ProjectDecisionPackageDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument

from app.api.mines.mine.models.mine import Mine

from app.api.activity.models.activity_notification import ActivityType
from app.api.activity.utils import trigger_notification
from app.api.activity.utils import ActivityRecipients
from app.api.utils.feature_flag import is_feature_enabled, Feature

class ProjectDecisionPackage(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_decision_package'

    project_decision_package_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_decision_package_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('project_decision_package_status_code.project_decision_package_status_code'),
        nullable=False)
    project = db.relationship("Project", back_populates="project_decision_package")
    documents = db.relationship(
        'ProjectDecisionPackageDocumentXref',
        lazy='select',
        primaryjoin='and_(ProjectDecisionPackageDocumentXref.project_decision_package_id == ProjectDecisionPackage.project_decision_package_id, ProjectDecisionPackageDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == False)'
    )
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='project_decision_package_document_xref',
        secondaryjoin='and_(foreign(ProjectDecisionPackageDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False, MineDocument.is_archived == False)'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_decision_package_id}'

    @classmethod
    def find_by_project_decision_package_guid(cls, _id):
        try:
            return cls.query.filter_by(
                project_decision_package_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_project_decision_package_id(cls, _id):
        try:
            return cls.query.filter_by(
                project_decision_package_id=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_project_guid(cls, _id):
        try:
            return cls.query.filter_by(
                project_guid=_id,
                deleted_ind=False).order_by(cls.project_decision_package_id.desc()).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        qy = db.session.query(ProjectDecisionPackage)
        try:
            if mine_document_guid is not None:
                query = qy\
                    .filter(ProjectDecisionPackage.project_decision_package_id == ProjectDecisionPackageDocumentXref.project_decision_package_id)\
                    .filter(ProjectDecisionPackageDocumentXref.mine_document_guid == mine_document_guid)
                return query.first()

            raise ValueError("Missing 'mine_document_guid'")

        except ValueError:
            return None

    @classmethod
    def create(cls,
               project,
               status_code,
               documents=[],
               add_to_session=True):
        project_decision_package = cls(
            project_guid=project.project_guid,
            status_code=status_code)

        if add_to_session:
            project_decision_package.save(commit=False)

        if documents:
            for doc in documents:
                mine_doc = MineDocument(
                    mine_guid=project.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                project_decision_package_doc = ProjectDecisionPackageDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    project_decision_package_id=project_decision_package.project_decision_package_id,
                    project_decision_package_document_type_code=doc.get(
                        'project_decision_package_document_type_code'))
                project_decision_package_doc.mine_document = mine_doc
                project_decision_package.documents.append(project_decision_package_doc)

        if add_to_session:
            project_decision_package.save(commit=False)

        return project_decision_package

    def update(self,
               project,
               status_code,
               documents=[],
               add_to_session=True):
        self.status_code = status_code

        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                project_decision_package_doc = ProjectDecisionPackageDocumentXref.find_by_mine_document_guid(mine_document_guid)
                project_decision_package_doc.project_decision_package_document_type_code = doc.get(
                    'project_decision_package_document_type_code')
            else:
                mine_doc = MineDocument(
                    mine_guid=project.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                project_decision_package_doc = ProjectDecisionPackageDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    project_decision_package_id=self.project_decision_package_id,
                    project_decision_package_document_type_code=doc.get(
                        'project_decision_package_document_type_code'))
                project_decision_package_doc.mine_document = mine_doc
                self.documents.append(project_decision_package_doc)

        if add_to_session:
            self.save(commit=False)

        if is_feature_enabled(Feature.MINE_APPLICATION_FILE_UDPATE_ALERTS):
            if len(documents) > 0:
                mine_document_guid = documents[0].mine_document_guid
                project = ProjectDecisionPackage.find_by_mine_document_guid(mine_document_guid).project
                renotify_hours = 24
                mine = Mine.find_by_mine_guid(project.mine_guid)
                trigger_notification(f'File(s) in project {project.project_title} has been updated for mine {mine.mine_name}.',
                    ActivityType.mine_project_documents_updated, mine, 'DocumentManagement', project.project_guid, None, None, ActivityRecipients.core_users, True, renotify_hours*60)

        return self

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        return super(ProjectDecisionPackage, self).delete(commit)
