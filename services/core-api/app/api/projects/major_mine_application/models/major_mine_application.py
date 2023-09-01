from multiprocessing.sharedctypes import Value
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from werkzeug.exceptions import BadRequest
from app.extensions import db

from app.config import Config
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.services.email_service import EmailService
from app.api.projects.project.models.project import Project
from app.api.projects.major_mine_application.models.major_mine_application_document_xref import MajorMineApplicationDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.mine.models.mine import Mine

from app.api.activity.models.activity_notification import ActivityType
from app.api.projects.project.projects_search_util import ProjectsSearchUtil
from app.api.activity.utils import trigger_notification
from app.api.activity.utils import ActivityRecipients

class MajorMineApplication(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'major_mine_application'

    major_mine_application_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    major_mine_application_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('major_mine_application_status_code.major_mine_application_status_code'),
        nullable=False)
    project = db.relationship("Project", back_populates="major_mine_application")
    documents = db.relationship(
        'MajorMineApplicationDocumentXref',
        lazy='select',
        primaryjoin='and_(MajorMineApplicationDocumentXref.major_mine_application_id == MajorMineApplication.major_mine_application_id, MajorMineApplicationDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == False)'
    )
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='major_mine_application_document_xref',
        secondaryjoin='and_(foreign(MajorMineApplicationDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False, MineDocument.is_archived == False)'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.major_mine_application_id}'

    @classmethod
    def find_by_major_mine_application_guid(cls, _id):
        try:
            return cls.query.filter_by(
                major_mine_application_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_major_mine_application_id(cls, _id):
        try:
            return cls.query.filter_by(
                major_mine_application_id=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_project_guid(cls, _id):
        try:
            return cls.query.filter_by(
                project_guid=_id,
                deleted_ind=False).order_by(cls.major_mine_application_id.desc()).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        qy = db.session.query(MajorMineApplication)
        try:
            if mine_document_guid is not None:
                query = qy\
                    .filter(MajorMineApplication.major_mine_application_id == MajorMineApplicationDocumentXref.major_mine_application_id)\
                    .filter(MajorMineApplicationDocumentXref.mine_document_guid == mine_document_guid)
                return query.first()

            raise ValueError("Missing 'mine_document_guid'")

        except ValueError:
            return None

    def send_mma_submit_email(self):
        recipients = [contact.email for contact in self.project.contacts]
        primary_documents = [document.document_name for document in self.documents if document.major_mine_application_document_type_code == "PRM"]
        spatial_documents = [document.document_name for document in self.documents if document.major_mine_application_document_type_code == "SPT"]
        supporting_documents = [document.document_name for document in self.documents if document.major_mine_application_document_type_code == "SPR"]

        def generate_list_element(element):
            return f'<li>{element}</li>'

        # TODO: Update this link with Config.MINESPACE_PRODUCTION_URL}/projects/{self.project_guid}/major-mine-application/{self.major_mine_application_guid}/review?step=3 and update frontend to support that
        link = f'{Config.MINESPACE_PRODUCTION_URL}/projects/{self.project_guid}/major-mine-application/entry'

        subject = f'Major Mine Application Submitted for {self.project.project_title}'
        body = '<p>The following documents have been submitted with this Major Mine Application:</p>'
        body += '<p>Primary document(s):</p>'
        body += f'<ul>{"".join(list(map(generate_list_element, primary_documents)))}</ul>'
        if len(spatial_documents) > 0:
            body += '<p>Spatial document(s):</p>'
            body += f'<ul>{"".join(list(map(generate_list_element, spatial_documents)))}</ul>'
        if len(supporting_documents) > 0:
            body += '<p>Supporting document(s):</p>'
            body += f'<ul>{"".join(list(map(generate_list_element, supporting_documents)))}</ul>'
        body += f'<p>View Major Mine Application in Minespace: <a href="{link}" target="_blank">{link}</a></p>'

        EmailService.send_email(subject, recipients, body, send_to_proponent=True)

    @classmethod
    def create(cls,
               project,
               status_code,
               documents=[],
               add_to_session=True):
        major_mine_application = cls(
            project_guid=project.project_guid,
            status_code=status_code)

        if add_to_session:
            major_mine_application.save(commit=False)

        if documents:
            for doc in documents:
                mine_doc = MineDocument(
                    mine_guid=project.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                major_mine_application_doc = MajorMineApplicationDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    major_mine_application_id=major_mine_application.major_mine_application_id,
                    major_mine_application_document_type_code=doc.get(
                        'major_mine_application_document_type_code'))
                major_mine_application_doc.mine_document = mine_doc
                major_mine_application.documents.append(major_mine_application_doc)

        if add_to_session:
            major_mine_application.save(commit=False)

        return major_mine_application

    def update(self,
               project,
               status_code,
               documents=[],
               add_to_session=True):
        self.status_code = status_code

        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                major_mine_application_doc = MajorMineApplicationDocumentXref.find_by_mine_document_guid(mine_document_guid)
                major_mine_application_doc.major_mine_application_document_type_code = doc.get(
                    'major_mine_application_document_type_code')
            else:
                mine_doc = MineDocument(
                    mine_guid=project.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                major_mine_application_doc = MajorMineApplicationDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    major_mine_application_id=self.major_mine_application_id,
                    major_mine_application_document_type_code=doc.get(
                        'major_mine_application_document_type_code'))
                major_mine_application_doc.mine_document = mine_doc
                self.documents.append(major_mine_application_doc)

        if add_to_session:
            self.save(commit=False)

            if len(documents) > 0:
                if Config.ENVIRONMENT_NAME != 'prod':
                    project = ProjectsSearchUtil.find_by_mine_document_guid(documents[0].get('mine_document_guid'))
                    renotify_hours = 24
                    mine = Mine.find_by_mine_guid(project.mine_guid)
                    trigger_notification(f'File(s) in project {project.project_title} has been updated for mine {mine.mine_name}.',
                        ActivityType.mine_project_documents_updated, mine, 'DocumentManagement', project.project_guid, None, None, ActivityRecipients.core_users, True, renotify_hours*60)

        return self

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        return super(MajorMineApplication, self).delete(commit)
