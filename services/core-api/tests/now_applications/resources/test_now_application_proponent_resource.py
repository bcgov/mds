import json

from tests.now_application_factories import NOWApplicationIdentityFactory

class TestApplicationProponentResource:
    """GET /now-applications/<string:now_application_guid>/proponent"""

    def test_get_proponent_now_application_success(self, test_client, db_session, auth_headers):
        num_created = 1
        now_applications = NOWApplicationIdentityFactory.create_batch(size=num_created)
        now_application_guid = now_applications[0].now_application_guid

        get_resp = test_client.get(f'/now-applications/{now_application_guid}/proponent', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['now_application_guid'] == str(now_application_guid)