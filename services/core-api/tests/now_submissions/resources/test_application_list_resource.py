import json

from tests.factories import NOWSubmissionFactory, MineFactory, NOWApplicationIdentityFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT


class TestGetApplicationListResource:
    """GET /now-applications/applications"""

    def test_get_now_application_list_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        submissions = NOWApplicationIdentityFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/now-applications', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in submissions)

    def test_get_application_list_pagination(self, test_client, db_session, auth_headers):
        """Should return paginated records"""

        batch_size = PER_PAGE_DEFAULT + 1
        NOWApplicationIdentityFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/now-applications', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == PER_PAGE_DEFAULT
        assert get_data['current_page'] == PAGE_DEFAULT
        assert get_data['total'] == batch_size

    def test_get_now_application_list_filter_by_status(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status"""

        now_submission_1 = NOWSubmissionFactory(status='Approved')
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1)
        now_submission_2 = NOWSubmissionFactory(status='Received')
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2)
        now_submission_3 = NOWSubmissionFactory(status='Rejected')
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3)
        now_submission_4 = NOWSubmissionFactory(status='Rejected')
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4)

        get_resp = test_client.get(f'now-applications?status=app,rec',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_noticeofworktype(self, test_client, db_session, auth_headers):
        """Should return the records filtered by noticeofworktype"""

        now_submission_1 = NOWSubmissionFactory(noticeofworktype='dog')
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1)
        now_submission_2 = NOWSubmissionFactory(noticeofworktype='dog')
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2)
        now_submission_3 = NOWSubmissionFactory(noticeofworktype='cat')
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3)
        now_submission_4 = NOWSubmissionFactory(noticeofworktype='parrot')
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4)

        get_resp = test_client.get(f'now-applications?notice_of_work_type_search=dog',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_mine_region(self, test_client, db_session, auth_headers):
        """Should return the records filtered by mine_region"""

        mine = MineFactory(mine_region='SE')
        mine2 = MineFactory(mine_region='NW')
        now_submission_1 = NOWSubmissionFactory(mine=mine)
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1, mine=mine)
        now_submission_2 = NOWSubmissionFactory(mine=mine)
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2, mine=mine)
        now_submission_3 = NOWSubmissionFactory(mine=mine2)
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3, mine=mine2)
        now_submission_4 = NOWSubmissionFactory(mine=mine2)
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4, mine=mine2)

        get_resp = test_client.get(f'now-applications?mine_region={mine.mine_region}',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_multiple_filters(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status, noticeofworktype, and tracking email"""

        now_submission_1 = NOWSubmissionFactory(status='Rejected', noticeofworktype='dog')
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1)
        now_submission_2 = NOWSubmissionFactory(status='Received', noticeofworktype='cat')
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2)
        now_submission_3 = NOWSubmissionFactory(status='Rejected', noticeofworktype='dog')
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3)
        now_submission_4 = NOWSubmissionFactory(status='Approved', noticeofworktype='cat')
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4)

        get_resp = test_client.get(
            f'now-applications?status=app,rej&notice_of_work_type_search=dog',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_1, now_submission_3])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'], get_data['records'])
            for submission in [now_submission_2, now_submission_4])
