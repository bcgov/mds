import json

from tests.factories import ProjectSummaryFactory
from flask_restplus import marshal
from app.api.mines.project_summary.response_models import PROJECT_SUMMARY_MODEL


def test_get_project_summary_by_project_summary_guid(test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory()

    get_resp = test_client.get(
        f'/mines/{project_summary.mine_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['project_summary_guid'] == str(project_summary.project_summary_guid)


def test_put_project_summary(test_client, db_session, auth_headers):

    project_summary = ProjectSummaryFactory()
    data = marshal(project_summary, PROJECT_SUMMARY_MODEL)

    data['project_summary_description'] = 'Test'

    put_resp = test_client.put(
        f'/mines/{project_summary.mine_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response

    assert put_data['project_summary_description'] == data['project_summary_description']
