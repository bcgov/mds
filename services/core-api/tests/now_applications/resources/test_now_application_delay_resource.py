import json, pytest, uuid
from datetime import datetime, timezone, timedelta

from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.now_application_factories import NOWApplicationDelayFactory
from tests.factories import MineFactory


class TestApplicationResource:
    """POST /now-applications/<guid>/delays"""

    def test_post_add_new_delay(self, test_client, db_session, auth_headers):

        now_application_identity = NOWApplicationIdentityFactory()
        
        payload = {
            'delay_type_code': 'SEC',
            'start_comment': 'test',
        }

        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/delays',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response

    def test_post_add_new_delay_fail_on_existing(self, test_client, db_session, auth_headers):

        now_application_identity = NOWApplicationIdentityFactory()

        payload = {
            'delay_type_code': 'SEC',
            'start_comment': 'test',
        }

        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/delays',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response

        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/delays',
            json=payload,
            headers=auth_headers['full_auth_header'])
            
        assert post_resp.status_code == 400, post_resp.response

    """PUT /now-applications/<guid>/delays/<guid>"""
    @pytest.mark.skip(reason='Needs further review to make the factories work with datetime timezones.')  
    def test_put_end_delay_success(self, test_client, db_session, auth_headers):

        now_app_delay = NOWApplicationDelayFactory(end_date=None)

        payload = {
            'delay_type_code': now_app_delay.delay_type_code,
            'start_comment': now_app_delay.start_comment,
            'start_date': now_app_delay.start_date.isoformat(),
            'end_date': datetime.datetime.utcnow().isoformat()
        }

        post_resp = test_client.put(
            f'/now-applications/{now_app_delay.now_application_guid}/delays/{now_app_delay.now_application_delay_guid}',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
    @pytest.mark.skip(reason='Needs further review to make the factories work with datetime timezones.')
    def test_put_end_delay_success_post_new_success(self, test_client, db_session, auth_headers):

        now_app_delay = NOWApplicationDelayFactory(end_date=None)

        payload = {
            'delay_type_code': now_app_delay.delay_type_code,
            'start_comment': now_app_delay.start_comment,
            'start_date': now_app_delay.start_date.isoformat(),
            'end_date': datetime.datetime.utcnow().isoformat()
        }

        post_resp = test_client.put(
            f'/now-applications/{now_app_delay.now_application_guid}/delays/{now_app_delay.now_application_delay_guid}',
            json=payload,
            headers=auth_headers['full_auth_header'])

        payload = {
            'delay_type_code': now_app_delay.delay_type_code,
            'start_comment': now_app_delay.start_comment,
            'start_date': (now_app_delay.end_date + datetime.timedelta(minutes=1)).isoformat()
        }

        post_resp = test_client.post(
            f'/now-applications/{now_app_delay.now_application_guid}/delays',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
    @pytest.mark.skip(reason='Needs further review to make the factories work with datetime timezones.')
    def test_put_fail_end_date_before_start_date(self, test_client, db_session, auth_headers):
        now_app_delay = NOWApplicationDelayFactory(end_date=None)

        payload = {
            'delay_type_code': now_app_delay.delay_type_code,
            'start_comment': now_app_delay.start_comment,
            'start_date': now_app_delay.start_date.isoformat(),
            'end_date': (now_app_delay.start_date - datetime.timedelta(days=1)).isoformat(),
        }

        post_resp = test_client.put(
            f'/now-applications/{now_app_delay.now_application_guid}/delays/{now_app_delay.now_application_delay_guid}',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
