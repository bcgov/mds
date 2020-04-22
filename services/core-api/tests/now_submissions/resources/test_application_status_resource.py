import json, datetime

from tests.factories import (NOWSubmissionFactory, NOWApplicationIdentityFactory)


class TestGetApplicationResource:
    """GET /now-submissions/applications/{now_number}/status"""
    def test_get_now_application_status_by_now_number_success(self, test_client, db_session,
                                                              auth_headers):
        """Should return the correct record with a 200 response code"""

        now_submission = NOWSubmissionFactory()
        identity = NOWApplicationIdentityFactory(now_submission=now_submission)
        get_resp = test_client.get(
            f'/now-submissions/applications/{identity.now_number}/status',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response

        get_data = json.loads(get_resp.data.decode())
        assert get_data['now_application_status_code'] is not None
        assert get_data[
            'now_application_status_code'] == identity.now_application.now_application_status_code

    """GET /now-submissions/applications/status?status_updated_date_since={date}"""
    def test_get_now_application_status_updates_since_success(self, test_client, db_session,
                                                              auth_headers):
        """Should return the correct records with a 200 response code"""
        today = datetime.datetime.today()
        status_updated_date = today
        identities = []
        for i in range(3):
            now_submission = NOWSubmissionFactory()
            identity = NOWApplicationIdentityFactory(now_submission=now_submission)
            identity.now_application.status_updated_date = status_updated_date
            status_updated_date = status_updated_date + datetime.timedelta(days=+1)
            identity.save()
            identities.append(identity)

        get_resp = test_client.get(
            f'/now-submissions/applications/status?status_updated_date_since={today}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data) == 3

        status_updated_date = today
        for identity in identities:
            identity.now_application.status_updated_date = status_updated_date
            status_updated_date = status_updated_date + datetime.timedelta(days=-1)
            identity.save()

        get_resp = test_client.get(
            f'/now-submissions/applications/status?status_updated_date_since={today}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data) == 1

        get_resp = test_client.get(
            f'/now-submissions/applications/status?status_updated_date_since={today + datetime.timedelta(days=+42)}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data) == 0
