import json

from tests.factories import InformationRequirementsTableFactory, ProjectFactory
from tests.factories import RequirementsFactory


def test_post_information_requirements_table(test_client, db_session, auth_headers):
    project = ProjectFactory()
    batch_size = 2
    requirements = list()

    for i in range(batch_size):
        requirements.append(RequirementsFactory())

    assert len(requirements) == 2

    data = {
        "irt": {
            "project_guid":
            project.project_guid,
            "status_code":
            "REC",
            "requirements": [{
                "requirement_guid": requirements[0].requirement_guid,
                "required": True,
                "methods": True,
                "comment": "Comments in Application Background"
            }, {
                "requirement_guid": requirements[1].requirement_guid,
                "required": True,
                "methods": True,
                "comment": "Comments in Proponent Information"
            }]
        }
    }

    post_resp = test_client.post(
        f'/projects/{project.project_guid}/information-requirements-table',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201

    post_data = json.loads(post_resp.data.decode())

    assert post_data['project_guid'] == str(project.project_guid)
    assert post_data['status_code'] == data['irt']['status_code']
    assert len(post_data['requirements']) == 2
