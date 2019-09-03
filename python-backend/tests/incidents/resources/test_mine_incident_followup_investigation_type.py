import json

from app.api.incidents.models.mine_incident_followup_investigation_type import MineIncidentFollowupInvestigationType


class TestGetIncidentFollowupInvestigationTypeResource:
    """GET /incidents/followup-types"""

    def test_get_incident_followup_types(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(f'/incidents/followup-types', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(MineIncidentFollowupInvestigationType.query.all()) > 0
        assert len(get_data['records']) == len(MineIncidentFollowupInvestigationType.query.all())
