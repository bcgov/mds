import json

from app.api.incidents.models.mine_incident_document_type_code import MineIncidentDocumentTypeCode


class TestGetIncidentDocumentTypeCodeResource:
    """GET /incidents/document-types"""
    def test_get_incident_determination_types(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/incidents/document-types', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(MineIncidentDocumentTypeCode.get_active()) > 0
        assert len(get_data['records']) == len(MineIncidentDocumentTypeCode.get_active())
