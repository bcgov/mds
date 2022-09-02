import json
from tests.factories import ProjectFactory


def test_post_project_decision_package(test_client, db_session, auth_headers):
    project = ProjectFactory()
    data = {
        "status_code": "INP",
        "documents": []
    }

    post_resp = test_client.post(
        f'/projects/{project.project_guid}/project-decision-package',
        data=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201


def test_post_project_decision_package_no_project_guid(test_client, db_session, auth_headers):
    project_guid = "58d42ac4-4280-44a7-8ef3-afabc9d20fce"
    data = {
        "status_code": "INP",
        "documents": []
    }

    post_resp = test_client.post(
        f'/projects/{project_guid}/project-decision-package',
        data=data,
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert 'Project not found' in post_data['message']
