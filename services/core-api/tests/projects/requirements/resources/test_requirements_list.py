import json
from app.api.projects.information_requirements_table.models.requirements import Requirements


def test_get_all_requirements(test_client, db_session, auth_headers):
    requirements = Requirements.get_all()

    get_resp = test_client.get(f'/projects/requirements', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200

    assert len(get_data['records']) == len(requirements)


def test_post_requirement(test_client, db_session, auth_headers):
    data = {
        "requirement": {
            "description": "New Requirement",
            "parent_requirement_id": 1,
            "display_order": 6,
            "version": 1
        }
    }

    post_resp = test_client.post(
        f'/projects/requirements', json=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201

    post_data = json.loads(post_resp.data.decode())

    assert post_data['description'] == 'New Requirement'
    assert post_data['parent_requirement_id'] == 1
    assert post_data['display_order'] == 6
