from multiprocessing.sharedctypes import Value
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from werkzeug.exceptions import NotFound

from app.api.activity.models.activity_notification import ActivityType, ActivityRecipients
from app.api.activity.utils import trigger_notification
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.documents.models.mine_document_bundle import MineDocumentBundle
from app.api.mines.mine.models.mine import Mine
from app.api.projects.major_mine_application.models.major_mine_application_document_xref import \
    MajorMineApplicationDocumentXref
from app.api.projects.project.models.project import Project
from app.api.projects.project.project_util import notify_file_updates
from app.api.services.email_service import EmailService
from app.api.utils.helpers import parse_status_code_to_text, format_datetime_to_string
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.config import Config
from app.extensions import db


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
        secondaryjoin='and_(foreign(MajorMineApplicationDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False, MineDocument.is_archived == False)',
        overlaps='major_mine_application_document_xref,mine_document,documents'
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

        # TODO: Update this link with Config.MINESPACE_PROD_URL}/projects/{self.project_guid}/major-mine-application/{self.major_mine_application_guid}/review?step=3 and update frontend to support that
        link = f'{Config.MINESPACE_PROD_URL}/projects/{self.project_guid}/major-mine-application/entry'

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
               documents=None,
               add_to_session=True):
        major_mine_application = cls(
            project_guid=project.project_guid,
            status_code=status_code)
        documents = documents or []

        if add_to_session:
            major_mine_application.save(commit=False)

        if documents:
            documents = MineDocumentBundle.parse_and_update_spatial_documents(documents)

            for doc in documents:
                mine_doc = MineDocument(
                    mine_guid=project.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'),
                    mine_document_bundle_id=doc['mine_document_bundle_id'] if doc.get('mine_document_bundle_id') else None)
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

        if documents:
            documents = MineDocumentBundle.parse_and_update_spatial_documents(documents)
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
                        document_manager_guid=doc.get('document_manager_guid'),
                        mine_document_bundle_id=doc.get('mine_document_bundle_id'))
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
            mine = Mine.find_by_mine_guid(str(project.mine_guid))
            if not mine:
                raise NotFound('Mine not found.')

            notify_file_updates(project, mine, status_code)

        return self

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        return super(MajorMineApplication, self).delete(commit)

    def send_application_emails(self, status_code: str, project: Project, subject: str, message: str):
        minespace_recipients = [contact.email for contact in project.contacts]
        core_recipients = []
        if status_code not in ['CHR', 'UNR']:
            core_recipients.append(MAJOR_MINES_OFFICE_EMAIL)
        if project.project_lead and status_code != 'CHR':
            core_recipients.append(project.project_lead.email)

        minespace_link = f'{Config.MINESPACE_PROD_URL}/projects/{self.project.project_guid}/overview'
        core_link = f'{Config.CORE_WEB_URL}/pre-applications/{self.project.project_guid}/app'

        context = {
            'message': message,
            'minespace_link': minespace_link,
            'core_link': core_link,
            'project_section': 'Application',
            'project': {
                'mine_name': project.mine_name,
                'mine_no': project.mine_no,
                'project_title': project.project_title,
                'submitted': format_datetime_to_string(self.update_timestamp)
            }
        }

        minespace_body = open("app/templates/email/projects/minespace_project_section_email.html", "r").read()
        core_body = open("app/templates/email/projects/ministry_project_section_email.html", "r").read()

        if core_recipients != []:
            EmailService.send_template_email(subject, core_recipients, core_body, context)
        if minespace_recipients != []:
            EmailService.send_template_email(subject, minespace_recipients, minespace_body, context)

    def send_mma_status_notifications(self, status_code):
            project: Project = self.project

            subject = f'Application Status Updated for {project.mine_name}:{project.project_title}'
            message = f'The status of the Application for the project {project.project_title} for {project.mine_name} has been updated to {parse_status_code_to_text(status_code)}.'

            self.send_application_emails(status_code, project, subject, message)

            mine = Mine.find_by_mine_guid(project.mine_guid)
            extra_data = {'project': {'project_guid': str(project.project_guid)}}
            trigger_notification(message, ActivityType.project_app_status_updated, mine,
                                 'MajorMineApplication', self.major_mine_application_guid, extra_data)


    def send_application_document_updated_notifications(self, document_count=1, status_code=None):
        mine: Mine = Mine.find_by_mine_guid(self.project.mine_guid)
        project: Project = Project.find_by_project_guid(self.project.project_guid)

        message_start = 'New application documents have' if document_count > 1 else 'A new application document has'
        message = f'{message_start} been uploaded for the project {self.project.project_title} for {self.project.mine_name}.'
        subject = f'Application documents updated for {project.mine_name}:{project.project_title}'

        self.send_application_emails(status_code, project, subject, message)

        extra_data = {'project': {'project_guid': str(self.project.project_guid)}}
        idempotency_key = f'{self.project_guid}-{self.major_mine_application_guid}'
        print('SHOULD TRIGGER NOTIFICATIONS')
        trigger_notification(message, ActivityType.project_app_documents_updated, mine,
                             'MajorMineApplication', self.major_mine_application_guid, extra_data, idempotency_key,
                             ActivityRecipients.all_users, True, 24 * 60)
