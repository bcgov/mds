import json
from datetime import datetime, timedelta

from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from tests.factories import MineFactory


class TestNOWApplicationStatus:
    """GET /now-applications/application-status-codes"""
    def test_get_application_status_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/application-status-codes', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(NOWApplicationStatus.get_all())

    """PUT /now_applications/ID/status"""

    def test_put_application_status(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True, mine_permit_amendments=1)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        put_resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/status',
            json={
                'issue_date': datetime.now().isoformat(),
                'auth_end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                'now_application_status_code': 'REJ'
            },
            headers=auth_headers['full_auth_header'])
        assert put_resp.status_code == 200, put_resp.response

    def test_put_application_status_WDN(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True, mine_permit_amendments=1)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        put_resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/status',
            json={
                'issue_date': datetime.now().isoformat(),
                'auth_end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                'now_application_status_code': 'WDN'
            },
            headers=auth_headers['full_auth_header'])
        assert put_resp.status_code == 200, put_resp.response
