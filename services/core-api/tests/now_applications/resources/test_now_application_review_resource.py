import json, pytest

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory,
                             NOWApplicationIdentityFactory, NOWApplicationFactory)


class TestPostApplicationReviewResource:
    """POST /now-applications/{application_guid}/progress"""
    def test_post_now_application_review_success(self, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)

        test_progress_data = {
            'now_application_review_type_code': 'REF',
            'referee_name': 'Fred',
        }
        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/reviews',
            json=test_progress_data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['now_application_review_type_code'] == test_progress_data[
            'now_application_review_type_code']

    def test_get_now_application_review_success(self, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)

        post_resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/reviews',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert len(post_data['records']) > 0
        assert 'response_date' in post_data['records'][0]
