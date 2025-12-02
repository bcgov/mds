from unittest.mock import patch, mock_open, call

import pytz

from app.api.activity.models.activity_notification import ActivityType, ActivityRecipients
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL, PERM_RECL_EMAIL, PROJECT_EMA_EMAILS
from app.api.utils.helpers import format_datetime_to_string, parse_status_code_to_text
from app.config import Config
from tests.factories import MajorMineApplicationFactory, PartyFactory

pytz.timezone('Canada/Pacific')


@patch("app.api.projects.major_mine_application.models.major_mine_application.trigger_notification")
@patch("app.api.services.email_service.EmailService.send_template_email")
def test_major_mine_application_notifications(mock_send_template_email, mock_trigger_notification, test_client,
                                              db_session, auth_headers):
    major_mine_application = MajorMineApplicationFactory()
    documents = [
        {
            "document_name": "test copy 3.pdf",
            "document_manager_guid": "55e1837b-9afd-4824-afbd-ffb3514cfe3e",
            "major_mine_application_document_type_code": "PRM",
            "mine_guid": major_mine_application.project.mine_guid
        }
    ]

    project = major_mine_application.project
    project.project_lead = PartyFactory(person=True)

    data = {
        'major_mine_application_guid': major_mine_application.major_mine_application_guid,
        'major_mine_application_id': major_mine_application.major_mine_application_id,
        'project_guid': project.project_guid,
        'documents': documents,
        'mine_guid': project.mine_guid,
        'status_code': 'CHR'
    }

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/major-mine-application/{major_mine_application.major_mine_application_guid}',
        headers=auth_headers['full_auth_header'],
        json=data
    )

    document_message_start = 'New application documents have' if len(
        documents) > 1 else 'A new application document has'
    document_message = f'{document_message_start} been uploaded for the project {project.project_title} for {project.mine_name}.'
    document_subject = f'Application documents updated for {project.mine_name}:{project.project_title}'
    minespace_link = f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/overview'
    core_link = f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/app'

    status_subject = f'Application Status Updated for {project.mine_name}:{project.project_title}'
    status_message = f'The status of the Application for the project {project.project_title} for {project.mine_name} has been updated to {parse_status_code_to_text(major_mine_application.status_code)}.'
    minespace_recipients = [contact.email for contact in project.contacts]

    document_context = {
        'message': document_message,
        'minespace_link': minespace_link,
        'core_link': core_link,
        'project_section': 'Application',
        'project': {
            'mine_name': project.mine_name,
            'mine_no': project.mine_no,
            'project_title': project.project_title,
            'submitted': format_datetime_to_string(major_mine_application.update_timestamp)
        }
    }

    expected_calls = [
        call(
            status_subject,
            minespace_recipients,
            "email/projects/minespace_project_section_email.html",
            {
                'message': status_message,
                'minespace_link': minespace_link,
                'core_link': core_link,
                'project_section': 'Application',
                'project': {
                    'mine_name': project.mine_name,
                    'mine_no': project.mine_no,
                    'project_title': project.project_title,
                    'submitted': format_datetime_to_string(major_mine_application.update_timestamp)
                }
            },
            reference_id=major_mine_application.major_mine_application_guid,
            reference_table='major_mine_application'
        ),
        call(
            document_subject,
            [MAJOR_MINES_OFFICE_EMAIL, project.project_lead.email],
            "email/projects/ministry_project_section_email.html",
            document_context,
            reference_id=major_mine_application.major_mine_application_guid,
            reference_table='major_mine_application'
        ),
        call(
            document_subject,
            minespace_recipients,
            "email/projects/minespace_project_section_email.html",
            document_context,
            reference_id=major_mine_application.major_mine_application_guid,
            reference_table='major_mine_application'
        )
    ]

    activity_feed_expected_calls = [
        call(
            status_message,
            ActivityType.project_app_status_updated,
            project.mine,
            'MajorMineApplication',
            major_mine_application.major_mine_application_guid,
            {
                'project': {
                    'project_guid': str(project.project_guid)
                }
            }
        ),
        call(
            document_message,
            ActivityType.project_app_documents_updated,
            project.mine,
            'MajorMineApplication',
            major_mine_application.major_mine_application_guid,
            {
                'project': {
                    'project_guid': str(project.project_guid)
                }
            },
            f'{major_mine_application.project_guid}-{major_mine_application.major_mine_application_guid}',
            ActivityRecipients.all_users,
            True,
            24 * 60
        )
    ]

    # Validate response
    assert put_resp.status_code == 200

    # Validate expected email calls
    mock_send_template_email.assert_has_calls(expected_calls, True)

    # Validate expected trigger_notification calls
    mock_trigger_notification.assert_has_calls(activity_feed_expected_calls, True)


@patch("app.api.services.email_service.EmailService.send_template_email")
def test_send_mma_submit_email(mock_send_template_email, test_client,
                               db_session, auth_headers):
    major_mine_application = MajorMineApplicationFactory(status_code='DFT')
    
    # Add various document types to test document grouping
    documents = [
        {
            "document_name": "Application_Form.pdf",
            "document_manager_guid": "11111111-1111-1111-1111-111111111111",
            "major_mine_application_document_type_code": "PRM",
            "mine_guid": major_mine_application.project.mine_guid
        },
        {
            "document_name": "Executive_Summary.pdf",
            "document_manager_guid": "22222222-2222-2222-2222-222222222222",
            "major_mine_application_document_type_code": "PRM",
            "mine_guid": major_mine_application.project.mine_guid
        },
        {
            "document_name": "Appendix_A.pdf",
            "document_manager_guid": "33333333-3333-3333-3333-333333333333",
            "major_mine_application_document_type_code": "APX",
            "mine_guid": major_mine_application.project.mine_guid
        },
        {
            "document_name": "Site_Map.pdf",
            "document_manager_guid": "44444444-4444-4444-4444-444444444444",
            "major_mine_application_document_type_code": "SPT",
            "mine_guid": major_mine_application.project.mine_guid
        },
        {
            "document_name": "Supporting_Doc.pdf",
            "document_manager_guid": "55555555-5555-5555-5555-555555555555",
            "major_mine_application_document_type_code": "SPR",
            "mine_guid": major_mine_application.project.mine_guid
        }
    ]

    project = major_mine_application.project
    project.project_lead = PartyFactory(person=True)

    data = {
        'major_mine_application_guid': major_mine_application.major_mine_application_guid,
        'major_mine_application_id': major_mine_application.major_mine_application_id,
        'project_guid': project.project_guid,
        'documents': documents,
        'mine_guid': project.mine_guid,
        'status_code': 'SUB'  # Transition to Submitted to trigger send_mma_submit_email
    }

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/major-mine-application/{major_mine_application.major_mine_application_guid}',
        headers=auth_headers['full_auth_header'],
        json=data
    )

    # Expected document lists by type
    primary_documents = ["Application_Form.pdf", "Executive_Summary.pdf"]
    appendix_documents = ["Appendix_A.pdf"]
    spatial_documents = ["Site_Map.pdf"]
    supporting_documents = ["Supporting_Doc.pdf"]

    subject = f'Major Mine Application Submitted for {project.project_title}'
    
    base_context = {
        'project': {
            'project_title': project.project_title
        },
        'primary_documents': primary_documents,
        'appendix_documents': appendix_documents,
        'spatial_documents': spatial_documents,
        'supporting_documents': supporting_documents
    }
    
    # Expected CORE email
    core_recipients = [PERM_RECL_EMAIL, project.project_lead.email]
    core_context = {
        **base_context,
        'view_link': f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/major-mine-application',
        'button_text': 'View Major Mine Application in CORE',
        'brand_type': 'core'
    }
    
    # Expected MineSpace email
    minespace_recipients = [contact.email for contact in project.contacts]
    minespace_context = {
        **base_context,
        'view_link': f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/major-mine-application/entry',
        'button_text': 'View Major Mine Application in MineSpace',
        'brand_type': 'minespace'
    }

    # Validate response
    assert put_resp.status_code == 200

    # Find the two mma_submit_email calls among all the email calls
    mma_submit_calls = [
        call_args for call_args in mock_send_template_email.call_args_list
        if 'mma_submit_email.html' in str(call_args)
    ]
    
    # Should have exactly 2 calls for mma_submit_email (CORE and MineSpace)
    assert len(mma_submit_calls) == 2
    
    # Verify CORE email call
    core_call = call(
        subject,
        core_recipients,
        'email/projects/mma_submit_email.html',
        core_context,
        reference_id=major_mine_application.major_mine_application_guid,
        reference_table='major_mine_application',
        reference_email_type='mma_submit_email_core'
    )
    assert core_call in mock_send_template_email.call_args_list
    
    # Verify MineSpace email call
    minespace_call = call(
        subject,
        minespace_recipients,
        'email/projects/mma_submit_email.html',
        minespace_context,
        reference_id=major_mine_application.major_mine_application_guid,
        reference_table='major_mine_application',
        reference_email_type='mma_submit_email_minespace'
    )
    assert minespace_call in mock_send_template_email.call_args_list
