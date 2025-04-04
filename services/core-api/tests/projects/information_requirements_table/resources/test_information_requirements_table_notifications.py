from unittest.mock import patch, mock_open, call

import pytz

from app.api.activity.models.activity_notification import ActivityType, ActivityRecipients
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL
from app.api.utils.helpers import format_datetime_to_string, parse_status_code_to_text
from app.config import Config
from tests.factories import MajorMineApplicationFactory, PartyFactory, InformationRequirementsTableFactory, \
    ProjectFactory

pytz.timezone('Canada/Pacific')

@patch("app.api.projects.information_requirements_table.models.information_requirements_table.trigger_notification")
@patch("app.api.services.email_service.EmailService.send_template_email")
@patch("builtins.open", mock_open(read_data='email content'))
def test_information_requirements_table_notifications(mock_send_template_email, mock_trigger_notification, test_client,
                                                      db_session, auth_headers):
    status_code = 'WDN'
    project = ProjectFactory()
    irt = InformationRequirementsTableFactory(project=project)
    project.project_lead = PartyFactory(person=True)

    data = { "status_code": status_code}

    put_resp = test_client.put(
        f'/projects/{irt.project.project_guid}/information-requirements-table/{irt.irt_guid}',
        data=data,
        headers=auth_headers['full_auth_header'])

    minespace_link = f'{Config.MINESPACE_PROD_URL}/projects/{project.project_guid}/overview'
    core_link = f'{Config.CORE_WEB_URL}/pre-applications/{project.project_guid}/information-requirements-table'

    message = f'The status of the IRT for the project {project.project_title} for {project.mine_name} has been updated to {parse_status_code_to_text(status_code)}.'
    subject = f'IRT Status Updated for {project.mine_name}:{project.project_title}'
    minespace_recipients = [contact.email for contact in project.contacts]

    context = {
        'message': f'An IRT status has changed to "{parse_status_code_to_text(status_code)}"',
        'minespace_link': minespace_link,
        'core_link': core_link,
        'section_status': parse_status_code_to_text(status_code),
        'project_section': 'IRT',
        'project': {
            'mine_name': project.mine_name,
            'mine_no': project.mine_no,
            'project_title': project.project_title,
            'submitted': format_datetime_to_string(irt.update_timestamp)
        }
    }

    expected_calls = [
        call(
            subject,
            minespace_recipients,
            'email content',
            context
        ),
        call(
            subject,
            [MAJOR_MINES_OFFICE_EMAIL, project.project_lead.email],
            'email content',
            context
        )
    ]

    activity_feed_expected_calls = [
        call(
            message,
            ActivityType.project_irt_status_updated,
            project.mine,
            'InformationRequirementsTable',
            irt.irt_guid,
            {
                'project': {
                    'project_guid': str(project.project_guid)
                }
            }
        )
    ]

    # Validate response
    assert put_resp.status_code == 200

    # Validate expected email calls
    mock_send_template_email.assert_has_calls(expected_calls, True)

    # Validate expected trigger_notification calls
    mock_trigger_notification.assert_has_calls(activity_feed_expected_calls, True)
