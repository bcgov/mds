import json, pytest

from tests.factories import (NOWSubmissionFactory, MineFactory, NOWClientFactory, NOWApplicationIdentityFactory)


class TestPostApplicationImportResource:
    """GET /now-applications/{application_guid}/import"""

    @pytest.mark.skip(
        reason='endpoint will be removed and import logic will be refactored into put')
    def test_post_now_application_import_success(self, test_client, db_session, auth_headers):

        now_application_identity = NOWApplicationIdentityFactory()
        post_resp = test_client.post(f'/now-applications/{now_application_identity.now_application_guid}/import',
                                     json={'mine_guid': now_application_identity.mine_guid},
                                     headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        post_data = json.loads(post_resp.data.decode())