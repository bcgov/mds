import json

from app.api.projects.information_requirements_table.models.requirements import Requirements
from tests.factories import ProjectFactory, InformationRequirementsTableFactory


def test_post_information_requirements_table_already_exists_on_project(
        test_client, db_session, auth_headers):
    project = ProjectFactory()
    InformationRequirementsTableFactory(project=project)

    post_resp = test_client.post(
        f'/projects/{project.project_guid}/information-requirements-table',
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 400


def test_post_information_requirements_table_project_does_not_exist(test_client, db_session,
                                                                    auth_headers):
    project = ProjectFactory()
    InformationRequirementsTableFactory()

    post_resp = test_client.post(
        f'/projects/{project.project_guid}/information-requirements-table',
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 400
