import json

from app.api.incidents.models.mine_incident_status_code import MineIncidentStatusCode


class TestGetIncidentStatusCodeResource:
    """GET /incidents/status-codes"""
    def test_get_incident_status_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/incidents/status-codes', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(MineIncidentStatusCode.get_active()) > 0
        assert len(get_data['records']) == len(MineIncidentStatusCode.get_active())
