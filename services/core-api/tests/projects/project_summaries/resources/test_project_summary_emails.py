from tests.factories import ProjectSummaryFactory
from app.api.constants import MDS_EMAIL
from app.config import Config

from unittest.mock import patch, mock_open, call, ANY

@patch("app.api.services.email_service.EmailService.send_template_email")
@patch("builtins.open", mock_open(read_data='email content'))

def test_sub_to_asg(mock_send_template_email, test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory(set_status_code='SUB')

    # TODO: ams_authorizations and documents should both have documents in order to test document emails

    updated_project_summary_title = 'Test Project Title - Updated'
    data = {}
    data['contacts'] = []    
    data['ams_authorizations'] = {}
    data['authorizations'] = []
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = updated_project_summary_title
    data['project_summary_description'] = project_summary.project_summary_description
    data['status_code'] = 'ASG'
    data['is_historic'] = False

    put_resp = test_client.put(
        f'/projects/{project_summary.project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data
    )
    emli_context = {
            "project_summary": {
                "project_summary_description": project_summary.project_summary_description,
            },
            "mine": {
                "mine_name": project_summary.mine_name,
                "mine_no": project_summary.project.mine_no,
            },
            "message": f'{updated_project_summary_title} for {project_summary.project.mine_name} has been assigned',
            "core_project_summary_link": f'{Config.CORE_WEB_URL}/pre-applications/{project_summary.project.project_guid}/overview'
        }
    
    # ARGS: subject, recipients, body, context, cc (ignore comparison with ANY)
    emli_call = call(f'Project Description Notification for {project_summary.mine_name}', ANY, ANY, emli_context, cc=[MDS_EMAIL])

    assert put_resp.status_code == 200
    calls = [emli_call]
    mock_send_template_email.assert_has_calls(calls, True)