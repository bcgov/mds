import json
from re import M

from tests.factories import MineFactory
from tests.factories import ProjectSummaryFactory
from tests.factories import ProjectFactory


def test_get_project_summaries_by_project_guid(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True, project=0)
    project = ProjectFactory(mine=mine, project_summary=0)
    ProjectSummaryFactory(project=project)

    get_resp = test_client.get(
        f'/projects/${project.project_guid}/project-summaries?mine_guid={mine.mine_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['records']) == 1


def test_post_project_summary_minimum(test_client, db_session, auth_headers):
    """Creating a new project summary will also create the parent project object"""

    mine = MineFactory(minimal=True)
    data = {
        'mine_guid': mine.mine_guid,
        'project_summary_title': 'Test title',
        'status_code': 'DFT'
    }

    post_resp = test_client.post(
        f'/projects/new/project-summaries/new', json=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(mine.mine_guid)
    assert post_data['project_summary_title'] == data['project_summary_title']
    assert post_data['status_code'] == data['status_code']
    assert post_data['project_guid'] is not None


def test_post_project_summary_with_authorizations(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    data = {
        'mine_guid':
        mine.mine_guid,
        'project_summary_title':
        'Sample title.',
        'status_code':
        'DFT',
        'authorizations': [{
            'project_summary_permit_type': ['NEW'],
            'project_summary_authorization_type': 'MINES_ACT_PERMIT',
            'existing_permits_authorizations': ['1234-x']
        }]
    }

    post_resp = test_client.post(
        f'/projects/new/project-summaries/new', json=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(mine.mine_guid)
    assert post_data['project_summary_title'] == data['project_summary_title']
    assert post_data['status_code'] == data['status_code']
    assert len(post_data['authorizations']) == len(data['authorizations'])
    assert post_data['authorizations'][0]['project_summary_permit_type'] == data['authorizations'][
        0]['project_summary_permit_type']
    assert post_data['authorizations'][0]['project_summary_authorization_type'] == data[
        'authorizations'][0]['project_summary_authorization_type']
    assert post_data['authorizations'][0]['existing_permits_authorizations'] == data[
        'authorizations'][0]['existing_permits_authorizations']
