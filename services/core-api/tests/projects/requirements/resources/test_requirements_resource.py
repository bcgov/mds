import json
import uuid

from app.api.projects.information_requirements_table.models.requirements import Requirements
from tests.factories import RequirementsFactory


def test_get_requirements_by_requirement_guid(test_client, db_session, auth_headers):
    requirement = RequirementsFactory()

    get_resp = test_client.get(
        f'/projects/requirements/{requirement.requirement_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['requirement_guid'] == str(requirement.requirement_guid)


def test_put_requirement(test_client, db_session, auth_headers):
    requirement = RequirementsFactory()

    data = {
        "requirement_guid": requirement.requirement_guid,
        "requirement_id": requirement.requirement_id,
        "parent_requirement_id": None,
        "description": "Updated Description for Test",
        "display_order": 1
    }

    put_resp = test_client.put(
        f'/projects/requirements/{requirement.requirement_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    updated_requirement = Requirements.find_by_requirement_guid(requirement.requirement_guid)

    assert put_resp.status_code == 200
    assert put_data['records']['requirement_guid'] == str(requirement.requirement_guid)
    assert put_data['records']['requirement_id'] == requirement.requirement_id
    assert put_data['records']['description'] == updated_requirement.description
    assert put_data['records']['display_order'] == updated_requirement.display_order


def test_delete_requirement(test_client, db_session, auth_headers):
    requirement = RequirementsFactory()

    del_resp = test_client.delete(
        f'/projects/requirements/{requirement.requirement_guid}',
        headers=auth_headers['full_auth_header'])

    updated_requirement = Requirements.find_by_requirement_guid(requirement.requirement_guid)

    assert del_resp.status_code == 204
    assert updated_requirement == None