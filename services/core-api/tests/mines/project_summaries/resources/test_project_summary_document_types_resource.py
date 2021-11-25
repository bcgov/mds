import json
from app.api.mines.project_summary.models.project_summary_document_type import ProjectSummaryDocumentType


# GET
def test_get_project_summary_document_types(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/mines/project-summary-document-types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == len(ProjectSummaryDocumentType.get_all())
    assert get_resp.status_code == 200
