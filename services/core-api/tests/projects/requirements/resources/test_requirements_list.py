import json
from app.api.projects.information_requirements_table.models.requirements import Requirements


def test_get_all_requirements(test_client, db_session, auth_headers):
    requirements = Requirements.get_all()

    get_resp = test_client.get(f'/projects/requirements', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200

    assert len(get_data['records']) == len(requirements)
