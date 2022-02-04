from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.schema import FetchedValue
from werkzeug.exceptions import BadRequest
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.access_decorators import is_minespace_user
from app.api.mines.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.project_summary.models.project_summary_contact import ProjectSummaryContact
from app.api.mines.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization
from app.api.mines.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType
from app.api.parties.party.models.party import Party
from app.api.constants import PROJECT_SUMMARY_EMAILS
from app.api.services.email_service import EmailService
from app.config import Config


class ProjectSummary(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary'

    project_summary_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_summary_title = db.Column(db.String(300), nullable=False)
    project_summary_description = db.Column(db.String(4000), nullable=True)
    proponent_project_id = db.Column(db.String(20), nullable=True)
    expected_draft_irt_submission_date = db.Column(db.DateTime, nullable=True)
    expected_permit_application_date = db.Column(db.DateTime, nullable=True)
    expected_permit_receipt_date = db.Column(db.DateTime, nullable=True)
    expected_project_start_date = db.Column(db.DateTime, nullable=True)

    project_summary_lead_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('project_summary_status_code.project_summary_status_code'),
        nullable=False)

    project_summary_lead = db.relationship(
        'Party',
        lazy='select',
        primaryjoin='Party.party_guid == ProjectSummary.project_summary_lead_party_guid')
    contacts = db.relationship(
        'ProjectSummaryContact',
        primaryjoin=
        'and_(ProjectSummaryContact.project_summary_guid == ProjectSummary.project_summary_guid, ProjectSummaryContact.deleted_ind == False)',
        lazy='selectin')
    authorizations = db.relationship(
        'ProjectSummaryAuthorization',
        primaryjoin=
        'and_(ProjectSummaryAuthorization.project_summary_guid == ProjectSummary.project_summary_guid, ProjectSummaryAuthorization.deleted_ind == False)',
        lazy='selectin')

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship('ProjectSummaryDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='project_summary_document_xref',
        secondaryjoin=
        'and_(foreign(ProjectSummaryDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_id}'

    @hybrid_property
    def project_summary_lead_name(self):
        if self.project_summary_lead_party_guid:
            party = Party.find_by_party_guid(self.project_summary_lead_party_guid)
            return party.name
        return None

    @hybrid_property
    def mine_name(self):
        return self.mine.mine_name

    @classmethod
    def find_by_project_summary_guid(cls, project_summary_guid, is_minespace_user):
        if is_minespace_user:
            return cls.query.filter_by(
                project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()
        return cls.query.filter(ProjectSummary.status_code.is_distinct_from("DFT")).filter_by(
            project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()

    @classmethod
    def find_by_mine_guid(cls, mine_guid, is_minespace_user):
        if is_minespace_user:
            return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()
        return cls.query.filter(ProjectSummary.status_code.is_distinct_from("DFT")).filter_by(
            mine_guid=mine_guid, deleted_ind=False).all()

    @classmethod
    def create(cls,
               mine,
               project_summary_description,
               project_summary_title,
               proponent_project_id,
               expected_draft_irt_submission_date,
               expected_permit_application_date,
               expected_permit_receipt_date,
               expected_project_start_date,
               status_code,
               documents=[],
               contacts=[],
               authorizations=[],
               add_to_session=True):
        project_summary = cls(
            project_summary_description=project_summary_description,
            mine_guid=mine.mine_guid,
            project_summary_title=project_summary_title,
            proponent_project_id=proponent_project_id,
            expected_draft_irt_submission_date=expected_draft_irt_submission_date,
            expected_permit_application_date=expected_permit_application_date,
            expected_permit_receipt_date=expected_permit_receipt_date,
            expected_project_start_date=expected_project_start_date,
            status_code=status_code)

        mine.project_summaries.append(project_summary)
        if add_to_session:
            project_summary.save(commit=False)

        for doc in documents:
            mine_doc = MineDocument(
                mine_guid=mine.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            project_summary_doc = ProjectSummaryDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                project_summary_id=project_summary.project_summary_id,
                project_summary_document_type_code='GEN')
            project_summary_doc.mine_document = mine_doc
            project_summary.documents.append(project_summary_doc)

        for contact in contacts:
            new_contact = ProjectSummaryContact(
                project_summary_guid=project_summary.project_summary_guid,
                name=contact.get('name'),
                job_title=contact.get('job_title'),
                company_name=contact.get('company_name'),
                email=contact.get('email'),
                phone_number=contact.get('phone_number'),
                phone_extension=contact.get('phone_extension'),
                is_primary=contact.get('is_primary'))
            project_summary.contacts.append(new_contact)

        for authorization in authorizations:
            # Validate permit types
            for permit_type in authorization['project_summary_permit_type']:
                valid_permit_type = ProjectSummaryPermitType.validate_permit_type(permit_type)
                if not valid_permit_type:
                    raise BadRequest(f'Invalid project description permit type: {permit_type}')

            new_authorization = ProjectSummaryAuthorization(
                project_summary_guid=project_summary.project_summary_guid,
                project_summary_authorization_type=authorization[
                    'project_summary_authorization_type'],
                project_summary_permit_type=authorization['project_summary_permit_type'],
                existing_permits_authorizations=authorization['existing_permits_authorizations'])
            project_summary.authorizations.append(new_authorization)

        if add_to_session:
            project_summary.save(commit=False)
        return project_summary

    def update(self,
               project_summary_description,
               project_summary_title,
               proponent_project_id,
               expected_draft_irt_submission_date,
               expected_permit_application_date,
               expected_permit_receipt_date,
               expected_project_start_date,
               status_code,
               project_summary_lead_party_guid,
               documents=[],
               contacts=[],
               authorizations=[],
               add_to_session=True):

        # Update simple properties.
        self.status_code = status_code
        self.project_summary_description = project_summary_description
        self.project_summary_title = project_summary_title
        self.proponent_project_id = proponent_project_id
        self.expected_draft_irt_submission_date = expected_draft_irt_submission_date
        self.expected_permit_application_date = expected_permit_application_date
        self.expected_permit_receipt_date = expected_permit_receipt_date
        self.expected_project_start_date = expected_project_start_date
        self.project_summary_lead_party_guid = project_summary_lead_party_guid

        # TODO - Turn this on when document removal is activated on the front end.
        # Get the GUIDs of the updated documents.
        # updated_document_guids = [doc.get('mine_document_guid') for doc in documents]

        # Delete deleted documents.
        # for doc in self.documents:
        #     if str(doc.mine_document_guid) not in updated_document_guids:
        #         self.mine_documents.remove(doc.mine_document)
        #         doc.mine_document.delete(commit=False)

        # Create or update existing documents.
        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                project_summary_doc = ProjectSummaryDocumentXref.find_by_mine_document_guid(
                    mine_document_guid)
                project_summary_doc.project_summary_document_type_code = 'GEN'
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                project_summary_doc = ProjectSummaryDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    project_summary_id=self.project_summary_id,
                    project_summary_document_type_code='GEN')
                project_summary_doc.mine_document = mine_doc
                self.documents.append(project_summary_doc)

        # Delete deleted contacts.
        updated_contact_ids = [contact.get('project_summary_contact_guid') for contact in contacts]
        for deleted_contact in self.contacts:
            if str(deleted_contact.project_summary_contact_guid) not in updated_contact_ids:
                deleted_contact.delete(commit=False)

        # Delete deleted authorizations.
        updated_authorization_ids = [
            authorization.get('project_summary_authorization_guid')
            for authorization in authorizations
        ]
        for deleted_authorization in self.authorizations:
            if str(deleted_authorization.project_summary_authorization_guid
                   ) not in updated_authorization_ids:
                deleted_authorization.delete(commit=False)

        # Create or update existing contacts.
        for contact in contacts:
            updated_contact_guid = contact.get('project_summary_contact_guid')
            if updated_contact_guid:
                updated_contact = ProjectSummaryContact.find_project_summary_contact_by_guid(
                    updated_contact_guid)
                updated_contact.name = contact.get('name')
                updated_contact.job_title = contact.get('job_title')
                updated_contact.company_name = contact.get('company_name')
                updated_contact.email = contact.get('email')
                updated_contact.phone_number = contact.get('phone_number')
                updated_contact.phone_extension = contact.get('phone_extension')
                updated_contact.is_primary = contact.get('is_primary')

            else:
                new_contact = ProjectSummaryContact(
                    project_summary_guid=self.project_summary_guid,
                    name=contact.get('name'),
                    job_title=contact.get('job_title'),
                    company_name=contact.get('company_name'),
                    email=contact.get('email'),
                    phone_number=contact.get('phone_number'),
                    phone_extension=contact.get('phone_extension'),
                    is_primary=contact.get('is_primary'))
                self.contacts.append(new_contact)

        # Create or update existing authorizations.
        for authorization in authorizations:
            # Validate permit types
            for permit_type in authorization['project_summary_permit_type']:
                valid_permit_type = ProjectSummaryPermitType.validate_permit_type(permit_type)
                if not valid_permit_type:
                    raise BadRequest(f'Invalid project description permit type: {permit_type}')

            updated_authorization_guid = authorization.get('project_summary_authorization_guid')
            if updated_authorization_guid:
                updated_authorization = ProjectSummaryAuthorization.find_by_project_summary_authorization_guid(
                    updated_authorization_guid)
                updated_authorization.project_summary_permit_type = authorization.get(
                    'project_summary_permit_type')
                updated_authorization.existing_permits_authorizations = authorization.get(
                    'existing_permits_authorizations')

            else:
                new_authorization = ProjectSummaryAuthorization(
                    project_summary_guid=self.project_summary_guid,
                    project_summary_authorization_type=authorization.get(
                        'project_summary_authorization_type'),
                    project_summary_permit_type=authorization.get('project_summary_permit_type'),
                    existing_permits_authorizations=authorization.get(
                        'existing_permits_authorizations'))
                self.authorizations.append(new_authorization)

        if add_to_session:
            self.save(commit=False)
        return self

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        return super(ProjectSummary, self).delete(commit)

    def send_project_summary_email_to_ministry(self, mine):
        recipients = PROJECT_SUMMARY_EMAILS

        subject = f'Project Description Notification for {mine.mine_name}'
        body = f'<p>{mine.mine_name} (Mine no: {mine.mine_no}) has submitted Project Description data in MineSpace</p>'
        body += f'<p>Overview: {self.project_summary_description}'

        link = f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine_guid}/permits-and-approvals/pre-applications'
        body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)