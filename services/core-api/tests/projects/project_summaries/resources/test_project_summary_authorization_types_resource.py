import json
from app.api.projects.project_summary.models.project_summary_authorization_type import ProjectSummaryAuthorizationType


# GET
def test_get_project_summary_authorization_types(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/projects/project-summary-authorization-types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == len(ProjectSummaryAuthorizationType.get_all())
    assert get_resp.status_code == 200
