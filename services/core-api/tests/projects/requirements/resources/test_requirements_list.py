from email import header
import json
import uuid

from app.api.projects.information_requirements_table.models.requirements import Requirements
from tests.factories import RequirementsFactory


def test_get_all_requirements(test_client, db_session, auth_headers):
    requirements = RequirementsFactory()

    get_resp = test_client.get(f'/projects/requirements', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200

    assert get_data['records'][0]['requirement_guid'] == str(requirements.requirement_guid)
