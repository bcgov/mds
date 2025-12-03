from unittest.mock import patch, call
from tests.factories import AmsFinalApplicationFactory, ProjectSummaryAmsAuthorizationFactory, ProjectSummaryFactory, AmsFinalApplicationDocumentXrefFactory
from app.api.projects.ams_final_application.models.ams_final_application import AmsFinalApplication, AmsAppNotificationEvent
from app.api.projects.ams_final_application.models.ams_final_application_document_type import AmsFinalApplicationDocumentType
from app.api.constants import PROJECT_EMA_EMAILS
from app.api.utils.helpers import format_datetime_to_string
from app.config import Config

def test_ams_final_app_find_by_auth_guid(db_session):
    final_app = AmsFinalApplicationFactory()

    query_result = AmsFinalApplication.find_by_authorization_guid(final_app.project_summary_authorization_guid)
    assert final_app.ams_final_application_guid == query_result.ams_final_application_guid

def test_ams_final_app_find_by_project_summary_guid(db_session):
    project_summary = ProjectSummaryFactory()

    auth_1 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_2 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_3 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_4 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)

    final_app_1 = AmsFinalApplicationFactory(project_summary_authorization=auth_1)
    final_app_2 = AmsFinalApplicationFactory(project_summary_authorization=auth_2)
    final_app_3 = AmsFinalApplicationFactory(project_summary_authorization=auth_3)

    result = AmsFinalApplication.find_by_project_summary_guid(project_summary.project_summary_guid)

    assert len(result) == 3


@patch("app.api.services.email_service.EmailService.send_template_email")
def test_send_notifications_submit(mock_send_template_email, db_session):
    final_app = AmsFinalApplicationFactory(submitted_timestamp=None)
    
    # Get available document types
    doc_types = AmsFinalApplicationDocumentType.get_all()
    
    # Create documents with different types
    doc1 = AmsFinalApplicationDocumentXrefFactory(
        ams_final_application=final_app,
        ams_final_application_document_type_code=doc_types[0].ams_final_application_document_type_code,
        mine_document__document_name='Document_Type_1_A.pdf'
    )
    doc2 = AmsFinalApplicationDocumentXrefFactory(
        ams_final_application=final_app,
        ams_final_application_document_type_code=doc_types[0].ams_final_application_document_type_code,
        mine_document__document_name='Document_Type_1_B.pdf'
    )
    doc3 = AmsFinalApplicationDocumentXrefFactory(
        ams_final_application=final_app,
        ams_final_application_document_type_code=doc_types[1].ams_final_application_document_type_code if len(doc_types) > 1 else doc_types[0].ams_final_application_document_type_code,
        mine_document__document_name='Document_Type_2_A.pdf'
    )
    
    db_session.flush()
    db_session.refresh(final_app)
    
    project_summary = final_app.project_summary_authorization.project_summary
    project = project_summary.project
    authorization = final_app.project_summary_authorization
    mine = project.mine
    
    final_app.send_notifications(AmsAppNotificationEvent.SUBMIT)
    
    subject = f'AMS Final Application Submitted for {project.project_title}'
    
    # Build expected document groups
    document_groups = []
    for doc_type in doc_types:
        docs = [doc_xref.document_name for doc_xref in final_app.documents 
                if doc_xref.ams_final_application_document_type_code == doc_type.ams_final_application_document_type_code]
        if docs:
            document_groups.append({
                'type_description': doc_type.description,
                'documents': docs
            })
    
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
        'submitted_date': format_datetime_to_string(final_app.submitted_timestamp),
        'document_groups': document_groups
    }
    
    # Expected CORE email
    core_recipients = PROJECT_EMA_EMAILS
    core_context = {
        **base_context,
        'view_link': f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/ams',
        'button_text': 'View AMS Application in CORE',
        'brand_type': 'core'
    }
    
    # Expected MineSpace email
    minespace_recipients = [contact.email for contact in project.contacts]
    minespace_context = {
        **base_context,
        'view_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/authorizations',
        'button_text': 'View AMS Application in MineSpace',
        'brand_type': 'minespace'
    }
    
    # Find the two ams_app_submit_email calls
    ams_submit_calls = [
        call_args for call_args in mock_send_template_email.call_args_list
        if 'ams_app_submit_email.html' in str(call_args)
    ]
    
    # Should have exactly 2 calls for ams_app_submit_email (CORE and MineSpace)
    assert len(ams_submit_calls) == 2
    
    # Verify CORE email call
    core_call = call(
        subject,
        core_recipients,
        'email/projects/ams_app_submit_email.html',
        core_context,
        reference_id=final_app.ams_final_application_guid,
        reference_table='ams_final_application',
        reference_email_type='ams_app_submit_email_core'
    )
    assert core_call in mock_send_template_email.call_args_list
    
    # Verify MineSpace email call
    minespace_call = call(
        subject,
        minespace_recipients,
        'email/projects/ams_app_submit_email.html',
        minespace_context,
        reference_id=final_app.ams_final_application_guid,
        reference_table='ams_final_application',
        reference_email_type='ams_app_submit_email_minespace'
    )
    assert minespace_call in mock_send_template_email.call_args_list


@patch("app.api.services.email_service.EmailService.send_template_email")
def test_send_notifications_resubmit(mock_send_template_email, db_session):
    final_app = AmsFinalApplicationFactory()
    
    project_summary = final_app.project_summary_authorization.project_summary
    project = project_summary.project
    mine = project.mine
    
    final_app.send_notifications(AmsAppNotificationEvent.RESUBMIT)
    
    subject = f'AMS Final Application Updated - {project.project_title}'
    message = f'Updates to EMA major project final application for {project.project_title} have been submitted for {mine.mine_name}'
    
    base_context = {
        'message': message,
        'project': {
            'mine_name': mine.mine_name,
            'mine_no': mine.mine_no,
            'project_title': project.project_title,
            'submitted': format_datetime_to_string(final_app.submitted_timestamp)
        },
        'project_section': 'AMS Final Application'
    }
    
    # Expected CORE email
    core_recipients = PROJECT_EMA_EMAILS
    core_context = {
        **base_context,
        'core_link': f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/ema-applications'
    }
    
    # Expected MineSpace email
    minespace_recipients = [contact.email for contact in project.contacts]
    minespace_context = {
        **base_context,
        'minespace_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/ema-applications'
    }
    
    # Should have exactly 2 calls (CORE and MineSpace)
    assert mock_send_template_email.call_count == 2
    
    # Verify CORE email call
    core_call = call(
        subject,
        core_recipients,
        'email/projects/ministry_project_section_email.html',
        core_context,
        reference_id=final_app.ams_final_application_guid,
        reference_table='ams_final_application',
        reference_email_type='ams_app_resubmit_email_core'
    )
    assert core_call in mock_send_template_email.call_args_list
    
    # Verify MineSpace email call
    minespace_call = call(
        subject,
        minespace_recipients,
        'email/projects/minespace_project_section_email.html',
        minespace_context,
        reference_id=final_app.ams_final_application_guid,
        reference_table='ams_final_application',
        reference_email_type='ams_app_resubmit_email_minespace'
    )
    assert minespace_call in mock_send_template_email.call_args_list


@patch("app.api.services.email_service.EmailService.send_template_email")
def test_send_notifications_edit_off(mock_send_template_email, db_session):
    final_app = AmsFinalApplicationFactory()
    
    project_summary = final_app.project_summary_authorization.project_summary
    project = project_summary.project
    mine = project.mine
    
    final_app.send_notifications(AmsAppNotificationEvent.EDIT_OFF)
    
    subject = f'AMS Final Application Locked - {project.project_title}'
    message = f'Your final application for {project.project_title} is locked for editing for {mine.mine_name}'
    
    recipients = [contact.email for contact in project.contacts]
    
    context = {
        'message': message,
        'project': {
            'mine_name': mine.mine_name,
            'mine_no': mine.mine_no,
            'project_title': project.project_title,
            'submitted': format_datetime_to_string(final_app.submitted_timestamp)
        },
        'project_section': 'AMS Final Application',
        'minespace_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/ema-applications'
    }
    
    # Should have exactly 1 call (MineSpace only)
    assert mock_send_template_email.call_count == 1
    
    expected_call = call(
        subject,
        recipients,
        'email/projects/minespace_project_section_email.html',
        context,
        reference_id=final_app.ams_final_application_guid,
        reference_table='ams_final_application',
        reference_email_type='ams_app_edit_off_email'
    )
    assert expected_call in mock_send_template_email.call_args_list


@patch("app.api.services.email_service.EmailService.send_template_email")
def test_send_notifications_edit_on(mock_send_template_email, db_session):
    final_app = AmsFinalApplicationFactory()
    
    project_summary = final_app.project_summary_authorization.project_summary
    project = project_summary.project
    mine = project.mine
    
    final_app.send_notifications(AmsAppNotificationEvent.EDIT_ON)
    
    subject = f'AMS Final Application Available for Editing - {project.project_title}'
    message = f'Your final application for {project.project_title} is available for edits for {mine.mine_name}'
    
    recipients = [contact.email for contact in project.contacts]
    
    context = {
        'message': message,
        'project': {
            'mine_name': mine.mine_name,
            'mine_no': mine.mine_no,
            'project_title': project.project_title,
            'submitted': format_datetime_to_string(final_app.submitted_timestamp)
        },
        'project_section': 'AMS Final Application',
        'minespace_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/ema-applications'
    }
    
    # Should have exactly 1 call (MineSpace only)
    assert mock_send_template_email.call_count == 1
    
    expected_call = call(
        subject,
        recipients,
        'email/projects/minespace_project_section_email.html',
        context,
        reference_id=final_app.ams_final_application_guid,
        reference_table='ams_final_application',
        reference_email_type='ams_app_edit_on_email'
    )
    assert expected_call in mock_send_template_email.call_args_list