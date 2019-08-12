import json

from tests.factories import NOWApplicationFactory


class TestGetApplicationResource:
    """GET /now-submissions/application/{application_guid}"""

    def test_get_now_application_by_guid(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        application = NOWApplicationFactory()
        get_resp = test_client.get(
            f'/now-submissions/applications/{application.application_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['application_guid'] == str(application.application_guid)
