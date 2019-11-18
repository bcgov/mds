import json

from app.api.now_applications.models.activity_summary.activity_type import ActivityType


class TestGetActivityTypeCode:
    """GET /now-applications/activity-type-code"""

    def test_get_activity_type_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(f'/now-applications/activity-type-code', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(ActivityType.active())