import json

from tests.factories import MineFactory, ProjectFactory, ProjectSummaryFactory, PartyFactory
from flask_restx import marshal
from app.api.projects.response_models import PROJECT_SUMMARY_MODEL


def test_get_project_by_project_guid(test_client, db_session, auth_headers):
    project = ProjectFactory()

    get_resp = test_client.get(
        f'/projects/{project.project_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['project_guid'] == str(project.project_guid)
    assert get_data['project_title'] == project.project_title


def test_get_projects_by_mine_guid(test_client, db_session, auth_headers):
    batch_size = 3
    mine = MineFactory(minimal=True, project=0)
    ProjectFactory.create_batch(mine=mine, size=batch_size)

    get_resp = test_client.get(
        f'/projects?mine_guid={mine.mine_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size
