from enum import Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from flask import current_app
from datetime import datetime, timezone
from app.api.utils.models_mixins import HistoryMixin, SoftDeleteMixin, AuditMixin, Base, DraftMixin
from app.api.projects.ams_final_application.models.ams_final_application_document_type import AmsFinalApplicationDocumentType
from app.api.projects.ams_final_application.models.ams_final_application_document_xref import AmsFinalApplicationDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.constants import PROJECT_EMA_EMAILS
from app.api.activity.utils import trigger_notification
from app.api.activity.models.activity_notification import ActivityType
from app.api.services.email_service import EmailService
from app.config import Config
from app.api.utils.helpers import format_datetime_to_string

class AmsAppNotificationEvent(Enum):
    SUBMIT = "SUBMIT"
    EDIT_OFF = "EDIT_OFF"
    EDIT_ON = "EDIT_ON"
    RESUBMIT = "RESUBMIT"

class AmsFinalApplication(HistoryMixin, SoftDeleteMixin, DraftMixin, AuditMixin, Base):
    __tablename__ = "ams_final_application"
    __versioned__ = {}

    ams_final_application_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_authorization_guid = db.Column(
        UUID(as_uuid=True), 
        db.ForeignKey('project_summary_authorization.project_summary_authorization_guid'),
        nullable=False
    )
    submitter_name = db.Column(db.String(200), nullable=False)
    is_agent = db.Column(db.Boolean, nullable=False, default=False)
    pre_submitted_files = db.Column(db.ARRAY(db.String))
    submitted_timestamp = db.Column(db.DateTime)
    documents = db.relationship(
        AmsFinalApplicationDocumentXref,
        lazy='select',
        primaryjoin='and_(AmsFinalApplicationDocumentXref.ams_final_application_guid == AmsFinalApplication.ams_final_application_guid, AmsFinalApplicationDocumentXref.deleted_ind == False)'
    )
    project_summary_authorization = db.relationship("ProjectSummaryAuthorization", back_populates="ams_final_application")
    editable = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.ams_final_application_guid}'
    
    @hybrid_property
    def mine_guid(self):
        return self.project_summary_authorization.project_summary.project.mine_guid
    
    @hybrid_property
    def project_summary_guid(self):
        return self.project_summary_authorization.project_summary.project_summary_guid
    
    @staticmethod
    def find_by_authorization_guid(authorization_guid):
        return AmsFinalApplication.query.filter_by(project_summary_authorization_guid=authorization_guid).one_or_none()
    
    @staticmethod
    def find_by_project_summary_guid(project_summary_guid):
        return AmsFinalApplication.query.join(AmsFinalApplication.project_summary_authorization).filter_by(project_summary_guid=project_summary_guid).all()
    
    @staticmethod
    def find_by_ams_final_application_guid(ams_final_application_guid):
        return AmsFinalApplication.query.filter_by(ams_final_application_guid=ams_final_application_guid).one_or_none()

    @classmethod
    def create(cls, 
               project_summary_authorization_guid,
               submitter_name,
               is_agent=False,
               pre_submitted_files=None,
               is_submitting=False,
               editable=True,
               ):
        final_app = cls(
            project_summary_authorization_guid=project_summary_authorization_guid,
            submitter_name=submitter_name,
            is_agent=is_agent,
            pre_submitted_files=pre_submitted_files or [],
            editable=editable,
        )
        if is_submitting:
            final_app.submitted_timestamp = datetime.now(timezone.utc)
            final_app.submit()
        else:
            final_app.save_draft()
        return final_app

    def update(self,          
               submitter_name,
               documents=[],
               is_agent=False,
               pre_submitted_files=None,
               is_submitting=False,
               ):
        self.submitter_name = submitter_name
        self.is_agent = is_agent
        self.pre_submitted_files = pre_submitted_files or []
        self._update_documents(documents)

        if is_submitting:
            is_resubmitting = self.submitted_timestamp is not None
            event = AmsAppNotificationEvent.RESUBMIT if is_resubmitting else AmsAppNotificationEvent.SUBMIT
            self.submitted_timestamp = self.submitted_timestamp or datetime.now(timezone.utc)
            self.submit()
            self.send_notifications(event)
        else:
            self.save_draft()
        return self
    
    def update_edit_toggle(self, editable= True):
        changed = self.editable != editable

        self.editable = editable        
        self.save()        
        if changed:
            event = AmsAppNotificationEvent.EDIT_ON if editable else AmsAppNotificationEvent.EDIT_OFF
            self.send_notifications(event)
        return self
    

    def send_notifications(self, event: AmsAppNotificationEvent):
        project_summary = self.project_summary_authorization.project_summary
        project = project_summary.project
        project_contacts = [contact.email for contact in project.contacts]
        
        core_recipients = PROJECT_EMA_EMAILS if event in [AmsAppNotificationEvent.SUBMIT, AmsAppNotificationEvent.RESUBMIT] else []
        minespace_recipients = project_contacts

        if event == AmsAppNotificationEvent.SUBMIT:
            self._send_submit_email(core_recipients, minespace_recipients)
        elif event == AmsAppNotificationEvent.RESUBMIT:
            self._send_resubmit_email(core_recipients, minespace_recipients)
        elif event in [AmsAppNotificationEvent.EDIT_ON, AmsAppNotificationEvent.EDIT_OFF]:
            self._send_edit_toggle_email(minespace_recipients, event)

    def _send_submit_email(self, core_recipients, minespace_recipients):
        project_summary = self.project_summary_authorization.project_summary
        project = project_summary.project
        authorization = self.project_summary_authorization
        mine = project.mine
        
        # Dynamically group documents by type code and get descriptions
        document_types = AmsFinalApplicationDocumentType.get_all()
        document_groups = []
        
        for doc_type in document_types:
            docs = [doc_xref.document_name for doc_xref in self.documents 
                    if doc_xref.ams_final_application_document_type_code == doc_type.ams_final_application_document_type_code]
            if docs:  # Only include document types that have documents
                document_groups.append({
                    'type_description': doc_type.description,
                    'documents': docs
                })
        
        subject = f'AMS Final Application Submitted for {project.project_title}'
        # Base context shared by both emails
        base_context = {
            'mine': {
                'mine_name': mine.mine_name,
                'mine_no': mine.mine_no
            },
            'project': {
                'project_title': project.project_title
            },
            'authorization': {
                'authorization_type': authorization.authorization_type.description if authorization.authorization_type else 'N/A',
                'auth_no': authorization.existing_permits_authorizations[0] if authorization.existing_permits_authorizations else 'N/A'
            },
            'submitted_date': format_datetime_to_string(self.submitted_timestamp),
            'document_groups': document_groups
        }
        
        # Send to CORE users
        if core_recipients:
            core_context = {
                **base_context,
                'view_link': f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/ams',
                'button_text': 'View AMS Application in CORE',
                'brand_type': 'core'
            }
            
            EmailService.send_template_email(
                subject,
                core_recipients,
                'email/projects/ams_app_submit_email.html',
                core_context,
                reference_id=self.ams_final_application_guid,
                reference_table='ams_final_application',
                reference_email_type='ams_app_submit_email_core'
            )
        
        # Send to MineSpace users
        if minespace_recipients:
            minespace_context = {
                **base_context,
                'view_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/authorizations',
                'button_text': 'View AMS Application in MineSpace',
                'brand_type': 'minespace'
            }
            
            EmailService.send_template_email(
                subject,
                minespace_recipients,
                'email/projects/ams_app_submit_email.html',
                minespace_context,
                reference_id=self.ams_final_application_guid,
                reference_table='ams_final_application',
                reference_email_type='ams_app_submit_email_minespace'
            )

    def _send_edit_toggle_email(self, recipients, event: AmsAppNotificationEvent):
        if not recipients:
            return
            
        project_summary = self.project_summary_authorization.project_summary
        project = project_summary.project
        mine = project.mine
        
        if event == AmsAppNotificationEvent.EDIT_OFF:
            message = f'Your final application for {project.project_title} is locked for editing for {mine.mine_name}'
            subject = f'AMS Final Application Locked - {project.project_title}'
        else:  # EDIT_ON
            message = f'Your final application for {project.project_title} is available for edits for {mine.mine_name}'
            subject = f'AMS Final Application Available for Editing - {project.project_title}'
        
        context = {
            'message': message,
            'project': {
                'mine_name': mine.mine_name,
                'mine_no': mine.mine_no,
                'project_title': project.project_title,
                'submitted': format_datetime_to_string(self.submitted_timestamp)
            },
            'project_section': 'AMS Final Application',
            'minespace_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/ema-applications'
        }
        
        EmailService.send_template_email(
            subject,
            recipients,
            'email/projects/minespace_project_section_email.html',
            context,
            reference_id=self.ams_final_application_guid,
            reference_table='ams_final_application',
            reference_email_type=f'ams_app_{event.value.lower()}_email'
        )

    def _send_resubmit_email(self, core_recipients, minespace_recipients):
        project_summary = self.project_summary_authorization.project_summary
        project = project_summary.project
        mine = project.mine
        
        message = f'Updates to EMA major project final application for {project.project_title} has been submitted for {mine.mine_name}'
        subject = f'AMS Final Application Updated - {project.project_title}'
        
        extra_data = {
            'project': {'project_guid': str(project.project_guid)},
            'project_summary': {'project_summary_guid': str(project_summary.project_summary_guid)},
            'project_summary_authorization': {'project_summary_authorization_guid': str(self.project_summary_authorization_guid)}
        }

        trigger_notification(message, ActivityType.ams_application_updated, mine,
                             'AMSApplication', self.ams_final_application_guid, extra_data)
        base_context = {
            'message': message,
            'project': {
                'mine_name': mine.mine_name,
                'mine_no': mine.mine_no,
                'project_title': project.project_title,
                'submitted': format_datetime_to_string(self.submitted_timestamp)
            },
            'project_section': 'AMS Final Application'
        }
        
        # Send to CORE users
        if core_recipients:
            core_context = {
                **base_context,
                'core_link': f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/ema-applications'
            }
            
            EmailService.send_template_email(
                subject,
                core_recipients,
                'email/projects/ministry_project_section_email.html',
                core_context,
                reference_id=self.ams_final_application_guid,
                reference_table='ams_final_application',
                reference_email_type='ams_app_resubmit_email_core'
            )
        
        # Send to MineSpace users
        if minespace_recipients:
            minespace_context = {
                **base_context,
                'minespace_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/ema-applications'
            }
            
            EmailService.send_template_email(
                subject,
                minespace_recipients,
                'email/projects/minespace_project_section_email.html',
                minespace_context,
                reference_id=self.ams_final_application_guid,
                reference_table='ams_final_application',
                reference_email_type='ams_app_resubmit_email_minespace'
            )

    def _update_documents(self, documents):  
        # Delete removed
        new_doc_guids = {d['document_manager_guid'] for d in documents if d.get('document_manager_guid')}
        deleted_documents = [d for d in self.documents if str(d.document_manager_guid) not in new_doc_guids]
 
        for xref in deleted_documents:
            xref.deleted_ind = True
            xref.save()

        # Add/update new
        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            doc_type_code = doc.get('ams_final_application_document_type_code')
            doc_type = AmsFinalApplicationDocumentType.get_by_document_code(doc_type_code)
            if not doc_type:
                current_app.logger.error(f'Invalid AmsFinalApplicationDocumentType: {doc_type_code}')
                continue  # skip invalid type
            
            if mine_document_guid:
                app_doc = AmsFinalApplicationDocumentXref.find_by_mine_document_guid(mine_document_guid)
                app_doc.ams_final_application_document_type_code = doc_type_code
  
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'),
                    mine_document_bundle_id=doc['mine_document_bundle_id'] if doc.get('mine_document_bundle_id') else None
                )
                app_doc = AmsFinalApplicationDocumentXref(
                    ams_final_application_guid=self.ams_final_application_guid,
                    mine_document=mine_doc,
                    ams_final_application_document_type_code=doc_type_code
                )

                self.documents.append(app_doc)