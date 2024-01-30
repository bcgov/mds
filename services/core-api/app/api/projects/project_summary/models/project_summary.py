from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import backref

from sqlalchemy.schema import FetchedValue
from sqlalchemy import case
from werkzeug.exceptions import BadRequest
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.access_decorators import is_minespace_user
from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project.models.project import Project
from app.api.projects.project_contact.models.project_contact import ProjectContact
from app.api.projects.project_summary.models.project_summary_contact import ProjectSummaryContact
from app.api.projects.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization
from app.api.projects.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.constants import PROJECT_SUMMARY_EMAILS, MDS_EMAIL
from app.api.services.email_service import EmailService
from app.config import Config

class ProjectSummary(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary'

    project_summary_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_summary_description = db.Column(db.String(4000), nullable=True)
    submission_date = db.Column(db.DateTime, nullable=True)
    expected_draft_irt_submission_date = db.Column(db.DateTime, nullable=True)
    expected_permit_application_date = db.Column(db.DateTime, nullable=True)
    expected_permit_receipt_date = db.Column(db.DateTime, nullable=True)
    expected_project_start_date = db.Column(db.DateTime, nullable=True)
    agent_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    is_agent = db.Column(db.Boolean, nullable=True)
    is_legal_land_owner = db.Column(db.Boolean, nullable=True)
    is_crown_land_federal_or_provincial = db.Column(db.Boolean, nullable=True)
    is_landowner_aware_of_discharge_application = db.Column(db.Boolean, nullable=True)
    has_landowner_received_copy_of_application = db.Column(db.Boolean, nullable=True)
    legal_land_owner_name = db.Column(db.String(200), nullable=True)
    legal_land_owner_contact_number = db.Column(db.String(20), nullable=True)
    legal_land_owner_email_address = db.Column(db.String(200), nullable=True)
    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)

    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('project_summary_status_code.project_summary_status_code'),
        nullable=False)

    project = db.relationship("Project", back_populates="project_summary")
    contacts = db.relationship(
        'ProjectContact',
        primaryjoin="and_(ProjectSummary.project_guid==foreign(ProjectContact.project_guid), ProjectContact.deleted_ind == False)"
    )
    agent = db.relationship(
        'Party', lazy='joined', foreign_keys=agent_party_guid
    )
    authorizations = db.relationship(
        'ProjectSummaryAuthorization',
        primaryjoin='and_(ProjectSummaryAuthorization.project_summary_guid == ProjectSummary.project_summary_guid, ProjectSummaryAuthorization.deleted_ind == False)',
        lazy='selectin')

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship(
        'ProjectSummaryDocumentXref',
        lazy='select',
        primaryjoin='and_(ProjectSummaryDocumentXref.project_summary_id == ProjectSummary.project_summary_id, ProjectSummaryDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == False)'
    )

    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='project_summary_document_xref',
        secondaryjoin='and_(and_(foreign(ProjectSummaryDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False), MineDocument.is_archived == False)'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_id}'

    @hybrid_property
    def project_summary_lead_name(self):
        if self.project.project_lead_party_guid:
            party = Party.find_by_party_guid(self.project.project_lead_party_guid)
            return party.name
        return None

    @hybrid_property
    def project_summary_lead_party_guid(self):
        if self.project.project_lead_party_guid:
            return self.project.project_lead_party_guid
        return None

    @hybrid_property
    def mine_guid(self):
        if self.project.mine_guid:
            return self.project.mine_guid
        return None

    @mine_guid.expression
    def mine_guid(cls):
        return case(
            [(cls.project.has(Project.mine_guid.isnot(None)), Project.mine_guid)],
            else_=None
        )


    @hybrid_property
    def mine_name(self):
        if self.project.mine_guid:
            mine = Mine.find_by_mine_guid(str(self.project.mine_guid))
            return mine.mine_name
        return None

    @hybrid_property
    def project_summary_title(self):
        if self.project.project_title:
            return self.project.project_title
        return None

    @hybrid_property
    def proponent_project_id(self):
        if self.project.proponent_project_id:
            return self.project.proponent_project_id
        return None

    @classmethod
    def find_by_project_summary_guid(cls, project_summary_guid, is_minespace_user=False):
        if is_minespace_user:
            return cls.query.filter_by(
                project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()
        return cls.query.filter(ProjectSummary.status_code.is_distinct_from("DFT")).filter_by(
            project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()

    @classmethod
    def find_by_mine_guid(cls, mine_guid_to_search):
        return cls.query.filter(cls.mine_guid == mine_guid_to_search).all()

    @classmethod
    def find_by_project_guid(cls, project_guid, is_minespace_user):
        if is_minespace_user:
            return cls.query.filter_by(project_guid=project_guid, deleted_ind=False).all()
        return cls.query.filter(ProjectSummary.status_code.is_distinct_from("DFT")).filter_by(
            project_guid=project_guid, deleted_ind=False).all()

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        qy = db.session.query(ProjectSummary)
        try:
            if mine_document_guid is not None:
                query = qy\
                    .filter(ProjectSummary.project_summary_id == ProjectSummaryDocumentXref.project_summary_id)\
                    .filter(ProjectSummaryDocumentXref.mine_document_guid == mine_document_guid)
                return query.first()

            raise ValueError("Missing 'mine_document_guid'")

        except ValueError:
            return None

    @classmethod
    def create(cls,
               project,
               mine,
               project_summary_description,
               expected_draft_irt_submission_date,
               expected_permit_application_date,
               expected_permit_receipt_date,
               expected_project_start_date,
               status_code,
               documents=[],
               authorizations=[],
               submission_date=None,
               add_to_session=True):

        project_summary = cls(
            project_summary_description=project_summary_description,
            project_guid=project.project_guid,
            expected_draft_irt_submission_date=expected_draft_irt_submission_date,
            expected_permit_application_date=expected_permit_application_date,
            expected_permit_receipt_date=expected_permit_receipt_date,
            expected_project_start_date=expected_project_start_date,
            status_code=status_code,
            submission_date=submission_date)

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
               project,
               project_summary_description,
               expected_draft_irt_submission_date,
               expected_permit_application_date,
               expected_permit_receipt_date,
               expected_project_start_date,
               status_code,
               project_lead_party_guid,
               documents=[],
               authorizations=[],
               submission_date=None,
               agent=None,
               is_agent=None,
               is_legal_land_owner=None,
               is_crown_land_federal_or_provincial=None,
               is_landowner_aware_of_discharge_application=None,
               has_landowner_received_copy_of_application=None,
               legal_land_owner_name=None,
               legal_land_owner_contact_number=None,
               legal_land_owner_email_address=None,
               latitude=None,
               longitude=None,
               add_to_session=True):

        # Update simple properties.
        # If we assign a project lead update status to Assigned and vice versa Submitted.
        if project_lead_party_guid and project.project_lead_party_guid is None:
            self.status_code = "ASG"
        elif project_lead_party_guid is None and project.project_lead_party_guid:
            self.status_code = "SUB"
        else:
            self.status_code = status_code

        self.project_summary_description = project_summary_description
        self.expected_draft_irt_submission_date = expected_draft_irt_submission_date
        self.expected_permit_application_date = expected_permit_application_date
        self.expected_permit_receipt_date = expected_permit_receipt_date
        self.expected_project_start_date = expected_project_start_date
        self.submission_date = submission_date
        self.is_legal_land_owner = is_legal_land_owner
        self.is_crown_land_federal_or_provincial = is_crown_land_federal_or_provincial
        self.is_landowner_aware_of_discharge_application = is_landowner_aware_of_discharge_application
        self.has_landowner_received_copy_of_application = has_landowner_received_copy_of_application
        self.legal_land_owner_name = legal_land_owner_name
        self.legal_land_owner_contact_number = legal_land_owner_contact_number
        self.legal_land_owner_email_address = legal_land_owner_email_address
        self.latitude=latitude
        self.longitude=longitude
        # TODO - Turn this on when document removal is activated on the front end.
        # Get the GUIDs of the updated documents.
        # updated_document_guids = [doc.get('mine_document_guid') for doc in documents]

        # Delete deleted documents.
        # for doc in self.documents:
        #     if str(doc.mine_document_guid) not in updated_document_guids:
        #         self.mine_documents.remove(doc.mine_document)
        #         doc.mine_document.delete(commit=False)

        # Create or update Agent Party
        # if updated values are received for party or their address,
        # currently just updating existing values (ie: same guid) not assigning a new party/address
        self.is_agent = is_agent   
        if not is_agent or is_agent is None or not agent:
            # unassign the agent party guid if previously set
            self.agent_party_guid = None
        else:
            address = agent.get('address')
            agent_party_guid = agent.get('party_guid')

            # if updates are made to the existing party:
            if self.agent_party_guid is not None and str(self.agent_party_guid) == agent_party_guid:
                Party.validate_phone_no(agent.get('phone_no'), address.get('address_type_code'))
                self.agent.deep_update_from_dict(agent)
                agent_address = Address(
                    suite_no=address.get('suite_no'),
                    address_line_1=address.get('address_line_1'),
                    city=address.get('city'),
                    sub_division_code=address.get('sub_division_code'),
                    post_code=address.get('post_code'),
                    address_type_code=address.get('address_type_code'),
                )

                self.agent.address.append(agent_address)
                self.agent.save()
            else:
                agent_party = Party.create(
                    party_name=agent.get('party_name'),
                    first_name=agent.get('first_name'),
                    phone_no=agent.get('phone_no'),
                    phone_ext=agent.get('phone_ext'),
                    email=agent.get('email'),
                    party_type_code=agent.get('party_type_code'),
                    job_title=agent.get('job_title'),
                    job_title_code='AGT',
                    address_type_code=address.get('address_type_code')
                )                
                agent_address = Address.create(
                    suite_no=address.get('suite_no'),
                    address_line_1=address.get('address_line_1'),
                    city=address.get('city'),
                    sub_division_code=address.get('sub_division_code'),
                    post_code=address.get('post_code'),
                    address_type_code=address.get('address_type_code'),
                )
                agent_party.address.append(agent_address)
                agent_party.save()
                self.agent_party_guid = agent_party.party_guid

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

        # Delete deleted authorizations.
        updated_authorization_ids = [
            authorization.get('project_summary_authorization_guid')
            for authorization in authorizations
        ]
        for deleted_authorization in self.authorizations:
            if str(deleted_authorization.project_summary_authorization_guid
                   ) not in updated_authorization_ids:
                deleted_authorization.delete(commit=False)

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

    def send_project_summary_email(self, mine):
        emli_recipients = PROJECT_SUMMARY_EMAILS
        cc = [MDS_EMAIL]
        minespace_recipients = [contact.email for contact in self.contacts if contact.is_primary]

        emli_body = open("app/templates/email/projects/emli_project_summary_email.html", "r").read()
        minespace_body = open("app/templates/email/projects/minespace_project_summary_email.html", "r").read()
        subject = f'Project Description Notification for {mine.mine_name}'

        emli_context = {
            "project_summary": {
                "project_summary_description": self.project_summary_description,
            },
            "mine": {
                "mine_name": mine.mine_name,
                "mine_no": mine.mine_no,
            },
            "core_project_summary_link": f'{Config.CORE_PRODUCTION_URL}/pre-applications/{self.project.project_guid}/overview'
        }

        minespace_context = {
            "mine": {
                "mine_name": mine.mine_name,
                "mine_no": mine.mine_no,
            },
            "minespace_project_summary_link": f'{Config.MINESPACE_PRODUCTION_URL}/projects/{self.project.project_guid}/overview',
            "ema_auth_link": f'{Config.EMA_AUTH_LINK}',
        }

        EmailService.send_template_email(subject, emli_recipients, emli_body, emli_context, cc=cc)
        EmailService.send_template_email(subject, minespace_recipients, minespace_body, minespace_context, cc=cc)
