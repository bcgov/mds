import json

from app.api.now_applications.models.now_application_progress_status import NOWApplicationProgressStatus


class TestGetNOWApplicationProgressStatus:
    """GET /now-applications/application-progress-status-codes"""
    def test_get_application_progress_status_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/application-progress-status-codes',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(NOWApplicationProgressStatus.get_active())