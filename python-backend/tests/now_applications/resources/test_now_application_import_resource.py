import json

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory)


class TestPostApplicationImportResource:
    """GET /now-applications/{application_guid}/import"""

    def test_post_now_application_import_success(self, test_client, db_session, auth_headers):

        submission = NOWSubmissionFactory()
        post_resp = test_client.post(
            f'/now-applications/{submission.application_guid}/import',
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_data.status_code == 200