from tests.factories import ProjectSummaryFactory, PartyFactory, ProjectSummaryAuthorizationFactory
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project.models.project import Project
from app.api.constants import MDS_EMAIL
from app.config import Config

from unittest.mock import patch, ANY


@patch("app.api.services.email_service.EmailService.send_template_email_async")
@patch("app.api.projects.project.models.project.Project.has_mines_act_auths", return_value=True)
def test_sub_to_asg(mock_has_mines_act_auths, mock_send_async, test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory(set_status_code='SUB')

    # TODO: ams_authorizations and documents should both have documents in order to test document emails

    party = PartyFactory(person=True)
    party.save()

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
    data['project_lead_party_guid'] = party.party_guid

    put_resp = test_client.put(
        f'/projects/{project_summary.project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data
    )

    ministry_context = {
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

    assert put_resp.status_code == 200
    mock_send_async.assert_called()
    ministry_calls = [
        c for c in mock_send_async.call_args_list
        if c.kwargs.get('reference_table') == 'project_summary'
    ]
    assert len(ministry_calls) >= 1
    ministry_call = ministry_calls[0]
    assert ministry_call.kwargs['context'] == ministry_context
    assert ministry_call.kwargs['cc'] == [MDS_EMAIL]
    assert ministry_call.kwargs['reference_id'] == str(project_summary.project_summary_guid)
    assert ministry_call.kwargs.get('distribution_list') is None