import json
from app.api.projects.project_summary.models.project_summary_status_code import ProjectSummaryStatusCode


# GET
def test_get_project_summary_status_codes(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/projects/project-summary-status-codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == len(ProjectSummaryStatusCode.get_all())
    assert get_resp.status_code == 200
