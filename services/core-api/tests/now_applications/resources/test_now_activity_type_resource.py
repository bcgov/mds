import json

from app.api.now_applications.models.activity_summary.activity_type import ActivityType


class TestGetActivityTypes:
    """GET /now-applications/activity-types"""
    def test_get_activity_types(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/activity-types', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(ActivityType.get_active())