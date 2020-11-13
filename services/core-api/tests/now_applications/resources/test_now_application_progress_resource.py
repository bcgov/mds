import json, pytest, datetime

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory,
                             NOWApplicationIdentityFactory, NOWApplicationFactory)


class TestPostApplicationProgressResource:
    """POST /now-applications/{application_guid}/progress"""
    def test_post_now_application_progress_success(self, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)
        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/progress/REV',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
        post_data = json.loads(post_resp.data.decode())

    def test_post_then_put_now_application_progress(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/progress/REV',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response

        post_resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/progress/REV',
            json={'end_date': datetime.datetime.now().isoformat()},
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response