import json

from tests.factories import MineFactory
from tests.factories import ProjectSummaryFactory


def test_get_project_summaries_by_mine_guid(test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory()

    get_resp = test_client.get(
        f'/mines/{project_summary.mine_guid}/project-summaries',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['records']) == 1


def test_get_project_summaries_by_invalid_mine_guid(test_client, db_session, auth_headers):
    batch_size = 3
    ProjectSummaryFactory.create_batch(size=batch_size)

    get_resp = test_client.get(
        f'/mines/badMineGuid123/project-summaries', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 404


def test_post_project_summary_minimum(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    data = {'project_summary_title': 'Sample title.', 'status_code': 'D'}

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/project-summaries',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201
    assert len(mine.project_summaries) == 1

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(mine.mine_guid)
    assert post_data['project_summary_title'] == data['project_summary_title']
    assert post_data['status_code'] == data['status_code']


def test_post_project_summary_with_contacts(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    data = {
        'project_summary_title':
        'Sample title.',
        'status_code':
        'D',
        'contacts': [{
            'name': 'Test Man',
            'email': 'email@test.com',
            'phone_number': '2508675309',
            'is_primary': True
        }]
    }

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/project-summaries',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201
    assert len(mine.project_summaries) == 1

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(mine.mine_guid)
    assert post_data['project_summary_title'] == data['project_summary_title']
    assert post_data['status_code'] == data['status_code']
    assert len(post_data['contacts']) == len(data['contacts'])
    assert post_data['contacts'][0]['name'] == data['contacts'][0]['name']
    assert post_data['contacts'][0]['email'] == data['contacts'][0]['email']
    assert post_data['contacts'][0]['phone_number'] == data['contacts'][0]['phone_number']
    assert post_data['contacts'][0]['is_primary'] == data['contacts'][0]['is_primary']


def test_post_project_summary_with_authorizations(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    data = {
        'project_summary_title':
        'Sample title.',
        'status_code':
        'D',
        'authorizations': [{
            'project_summary_permit_type': ['NEW'],
            'project_summary_authorization_type': 'MINES_ACT_PERMIT',
            'existing_permits_authorizations': ['1234-x']
        }]
    }

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/project-summaries',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201
    assert len(mine.project_summaries) == 1

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
