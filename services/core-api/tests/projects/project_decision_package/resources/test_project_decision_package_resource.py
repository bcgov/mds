import json

from flask_restx import marshal
from tests.factories import ProjectFactory, ProjectDecisionPackageFactory
from app.api.projects.response_models import PROJECT_DECISION_PACKAGE_MODEL


def test_get_project_decision_package_by_project_decision_package_guid(test_client, db_session,
                                                                       auth_headers):
    project = ProjectFactory()
    project_decision_package = ProjectDecisionPackageFactory(project=project)

    get_resp = test_client.get(
        f'/projects/{project_decision_package.project.project_guid}/project-decision-package/{project_decision_package.project_decision_package_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['project_guid'] == str(project_decision_package.project.project_guid)
    assert get_data['project_decision_package_guid'] == str(
        project_decision_package.project_decision_package_guid)
    assert get_data['status_code'] == str(project_decision_package.status_code)
    