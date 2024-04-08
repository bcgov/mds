import json

from tests.now_application_factories import NOWApplicationIdentityFactory


class TestApplicationNowNumbersResource:
    """POST /now-applications/now-numbers"""

    def test_get_now_application_no_now_number_success(self, test_client, db_session, auth_headers):
        num_created = 3
        NOWApplicationIdentityFactory.create_batch(size=num_created)

        post_resp = test_client.post(f'/now-applications/now-numbers', headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        get_data = json.loads(post_resp.data.decode())
        assert len(get_data['records']) == num_created

    def test_get_now_application_by_now_number_success_filter_by_guid(self, test_client, db_session,
                                                                      auth_headers):
        num_created = 3
        NOWApplicationlist = NOWApplicationIdentityFactory.create_batch(size=num_created)

        post_resp = test_client.post(
            f'/now-applications/now-numbers?mine_guid={NOWApplicationlist[0].mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        get_data = json.loads(post_resp.data.decode())
        assert len(get_data['records']) == 1

    def test_get_now_application_by_now_number_success(self, test_client, db_session, auth_headers):
        num_created = 3
        NOWApplicationList = NOWApplicationIdentityFactory.create_batch(size=num_created)

        payload = {
            'now_numbers': [str(NOWApplicationList[0].now_number), str(NOWApplicationList[1].now_number)]
        }

        post_resp = test_client.post(
            f'/now-applications/now-numbers', json=payload, headers=auth_headers['full_auth_header'])

        assert post_resp.status_code == 200, post_resp.response
        response_data = json.loads(post_resp.get_data(as_text=True))
        assert len(response_data['records']) == 2
