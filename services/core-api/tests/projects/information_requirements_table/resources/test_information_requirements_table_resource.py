import json

from tests.factories import InformationRequirementsTableFactory, ProjectFactory, RequirementsFactory
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable


def test_get_information_requirements_table_by_irt_guid(test_client, db_session, auth_headers):
    project = ProjectFactory()
    irt = InformationRequirementsTableFactory(project=project)

    get_resp = test_client.get(
        f'/projects/{irt.project.project_guid}/information-requirements-table/{irt.irt_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['project_guid'] == str(irt.project.project_guid)
    assert get_data['irt_guid'] == str(irt.irt_guid)
    assert get_data['status_code'] == str(irt.status_code)


def test_put_information_requirements_table(test_client, db_session, auth_headers):
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

    data = {
        "irt": {
            "project_guid":
            project.project_guid,
            "status_code":
            "UNR",
            "requirements": [{
                "requirement_guid": requirements[0].requirement_guid,
                "required": False,
                "methods": False,
                "comment": "Modifications in Application Background"
            }, {
                "requirement_guid": requirements[1].requirement_guid,
                "required": False,
                "methods": False,
                "comment": "Modifications in Proponent Information"
            }]
        }
    }

    put_resp = test_client.put(
        f"/projects/{post_data['project_guid']}/information-requirements-table/{post_data['irt_guid']}",
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response
    assert put_data['project_guid'] == post_data['project_guid']
    assert put_data['irt_guid'] == post_data['irt_guid']

    assert all(put_data['requirements'][i]['required'] == str(False)
               for i in range(len(put_data['requirements'])))
    assert all(put_data['requirements'][i]['methods'] == str(False)
               for i in range(len(put_data['requirements'])))


def test_delete_information_requirements_table(test_client, db_session, auth_headers):
    project = ProjectFactory()
    irt = InformationRequirementsTableFactory(project=project)

    del_resp = test_client.delete(
        f'/projects/{project.project_guid}/information-requirements-table/{irt.irt_guid}',
        headers=auth_headers['full_auth_header'])

    updated_irt = InformationRequirementsTable.find_by_irt_guid(str(irt.irt_guid))

    assert del_resp.status_code == 204
    assert updated_irt == None