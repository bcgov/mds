import json

from tests.now_application_factories import NOWApplicationIdentityFactory

class TestApplicationProponentListResource:
    """GET /mines/<string:mine_guid>/now-applications"""

    def test_get_proponent_now_application_list_success(self, test_client, db_session, auth_headers):
        """Should return response on request success"""
        num_created = 1
        now_applications = NOWApplicationIdentityFactory.create_batch(size=num_created)
        mine_guid = now_applications[0].mine_guid

        get_resp = test_client.get(f'/mines/{str(mine_guid)}/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data) == num_created

    def test_get_proponent_now_application_list_failure(self, test_client, db_session, auth_headers):
        """Should return error if mine_guid doesn't exist"""
        mine_guid = "3e2adc87-2312-40dc-9942-327ea7e2fff8"
        get_resp = test_client.get(f'/mines/{str(mine_guid)}/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404