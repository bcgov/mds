from unittest.mock import patch, mock_open, call

import pytz

from app.api.activity.models.activity_notification import ActivityType, ActivityRecipients
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL
from app.api.utils.helpers import format_datetime_to_string, parse_status_code_to_text
from app.config import Config
from tests.factories import MajorMineApplicationFactory, PartyFactory

pytz.timezone('Canada/Pacific')


@patch("app.api.projects.major_mine_application.models.major_mine_application.trigger_notification")
@patch("app.api.services.email_service.EmailService.send_template_email")
@patch("builtins.open", mock_open(read_data='email content'))
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
            'email content',
            {
                'message': status_message,
                'minespace_link': minespace_link,
                'core_link': core_link,
                'project_section': 'Application',
                'project': {
                    'mine_name': project.mine_name,
                    'mine_no': '',
                    'project_title': project.project_title,
                    'submitted': format_datetime_to_string(major_mine_application.update_timestamp)
                }
            }
        ),
        call(
            document_subject,
            [MAJOR_MINES_OFFICE_EMAIL, project.project_lead.email],
            'email content',
            document_context
        ),
        call(
            document_subject,
            minespace_recipients,
            'email content',
            document_context
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
