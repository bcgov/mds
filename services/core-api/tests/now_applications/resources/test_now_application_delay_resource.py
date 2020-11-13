import json, pytest, datetime

from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.now_application_factories import NOWApplicationDelayFactory
from tests.factories import MineFactory


class TestApplicationResource:
    """GET /now-applications/"""
    def test_get_now_application_delay_success(self, test_client, db_session, auth_headers):
        now_app_guid = NOWApplicationIdentityFactory().now_application_guid

        get_resp = test_client.get(
            f'/now-applications/{now_app_guid}/delays', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 1

    """POST /now-applications/"""

    def test_post_add_new_delay(self, test_client, db_session, auth_headers):

        now_app_delay = NOWApplicationDelayFactory(end_date=datetime.datetime.now())

        payload = {
            'delay_type_code': now_app_delay.delay_type_code,
            'start_comment': now_app_delay.start_comment,
            'start_date': (now_app_delay.end_date + datetime.timedelta(minutes=1)).isoformat()
        }
        print(payload['start_date'])

        post_resp = test_client.post(
            f'/now-applications/{now_app_delay.now_application_guid}/delays',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
