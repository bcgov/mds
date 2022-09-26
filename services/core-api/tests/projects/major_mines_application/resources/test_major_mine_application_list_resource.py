import json

from tests.factories import ProjectFactory


def test_post_major_mine_application(test_client, db_session, auth_headers):
    project = ProjectFactory()
    data = {
        "project_guid": project.project_guid,
        "status_code": "SUB",
        "documents": [],
        "update_user": "mining@bceid.com",
        "update_timestamp": "2022-07-14T04:32:58.666528+00:00",
        "create_user": "mining@bceid.com",
        "create_timestamp": "2022-07-14T04:32:58.666414+00:00"
    }

    post_resp = test_client.post(
        f'/projects/{project.project_guid}/major-mine-application',
        data=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201