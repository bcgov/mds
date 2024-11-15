import json
from tests.factories import MineFactory, ProjectFactory
from app.api.projects.project.models.project import Project
from datetime import datetime


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


def test_get_filtered_projects(test_client, db_session, auth_headers):
    batch_size = 3
    mine = MineFactory(minimal=True, project=0)
    ProjectFactory.create_batch(mine=mine, size=batch_size)
    mine_guid = mine.mine_guid
    specific_mine_name = mine.mine_name
    projects = Project.find_by_mine_guid(str(mine_guid))

    get_resp = test_client.get(
        f'/projects/dashboard?page=1&per_page=10&sort_field=update_timestamp&sort_dir=desc&search={specific_mine_name}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size
    assert all(project.mine_guid == mine_guid for project in projects)
    for i in range(len(get_data['records']) - 1):
        current_date = datetime.fromisoformat(get_data['records'][i]['update_timestamp'])
        next_date = datetime.fromisoformat(get_data['records'][i + 1]['update_timestamp'])
        assert current_date.strftime('%Y-%m-%d') >= next_date.strftime('%Y-%m-%d')
    
