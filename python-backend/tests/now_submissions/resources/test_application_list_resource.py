import json

from tests.factories import NOWApplicationFactory
from app.api.now_submissions.resources.application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT


class TestGetApplicationListResource:
    """GET /now-submissions/applications"""

    def test_get_now_application_list_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        applications = NOWApplicationFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/now-submissions/applications', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size
        assert all(
            str(application.application_guid) in map(lambda x: x['application_guid'], get_data['records'])
            for application in applications)

    def test_get_application_list_pagination(self, test_client, db_session, auth_headers):
        """Should return paginated records"""

        batch_size = PER_PAGE_DEFAULT + 1
        NOWApplicationFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/now-submissions/applications', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == PER_PAGE_DEFAULT
        assert get_data['current_page'] == PAGE_DEFAULT
        assert get_data['total'] == batch_size
