import json, pytest

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory,
                             NOWApplicationIdentityFactory, NOWApplicationFactory)


class TestPostApplicationProgressResource:
    """POST /now-applications/{application_guid}/progress"""
    def test_post_now_application_progress_success(self, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)
        test_progress_data = {
            'application_progress_status_code': 'REV',
        }
        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/progress',
            json=test_progress_data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['application_progress_status_code'] == test_progress_data[
            'application_progress_status_code']
