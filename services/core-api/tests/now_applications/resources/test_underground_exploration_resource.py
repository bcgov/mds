import json

from app.api.now_applications.models.activity_detail.underground_exploration_type import UndergroundExplorationType


class TestGetUndergroundExplorationType:
    """GET /now-applications/underground-exploration-types"""
    def test_get_underground_exploration_types(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/underground-exploration-types',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(UndergroundExplorationType.get_active())