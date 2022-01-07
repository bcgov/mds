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
