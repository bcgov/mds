import json
from app.api.mines.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType


# GET
def test_get_project_summary_permit_types(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/mines/project-summary-permit-types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == len(ProjectSummaryPermitType.get_all())
    assert get_resp.status_code == 200
