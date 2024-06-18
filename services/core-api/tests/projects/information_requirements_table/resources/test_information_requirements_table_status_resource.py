import json

from tests.factories import InformationRequirementsTableFactory, ProjectFactory
from flask_restx import marshal
from app.api.projects.response_models import IRT_MODEL


def test_put_information_requirements_table_status(test_client, db_session, auth_headers):
    project = ProjectFactory()
    irt = InformationRequirementsTableFactory(project=project)

    data = marshal(project, IRT_MODEL)

    data['status_code'] = 'SUB'

    put_resp = test_client.put(
        f'/projects/{irt.project.project_guid}/information-requirements-table/{irt.irt_guid}/status',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 200
    put_data = json.loads(put_resp.data.decode())
    assert put_data['status_code'] == data['status_code']
