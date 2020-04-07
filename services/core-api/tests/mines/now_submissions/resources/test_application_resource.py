import json, pytest

from tests.factories import MineFactory, NOWSubmissionFactory, NOWApplicationIdentityFactory


class TestGetMineApplicationResource:
    """GET mines/{mine_guid}/now-applications"""
    def test_get_mine_application_list_success(self, test_client, db_session, auth_headers):
        """Should return the records for the mine with a 200 response code"""

        batch_size = 5
        other_applications = NOWApplicationIdentityFactory.create_batch(size=batch_size)
        mine = MineFactory(minimal=True)
        now_submission_1 = NOWSubmissionFactory(mine=mine)
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1, mine=mine)
        now_submission_2 = NOWSubmissionFactory(mine=mine)
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2, mine=mine)

        get_resp = test_client.get(
            f'now-applications?mine_guid={mine.mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in other_applications)
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_1])

    @pytest.mark.skip(reason='Status refactor broke ability to deploy')
    def test_get_mine_application_list_filter_by_status(self, test_client, db_session,
                                                        auth_headers):
        """Should return the records filtered by status"""

        mine = MineFactory(minimal=True)
        now_submission_1 = NOWSubmissionFactory(mine=mine, status='Accepted')
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1, mine=mine)
        now_submission_2 = NOWSubmissionFactory(mine=mine, status='Withdrawn')
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2, mine=mine)
        now_submission_3 = NOWSubmissionFactory(mine=mine, status='Withdrawn')
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3, mine=mine)
        now_submission_4 = NOWSubmissionFactory(mine=mine, status='Withdrawn')
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4, mine=mine)

        get_resp = test_client.get(
            f'now-applications?mine_guid={mine.mine_guid}&now_application_status_description=Accepted&now_application_status_description=Withdrawn',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_mine_application_list_filter_by_noticeofworktype(self, test_client, db_session,
                                                                  auth_headers):
        """Should return the records filtered by noticeofworktype"""

        mine = MineFactory(minimal=True)
        now_submission_1 = NOWSubmissionFactory(mine=mine, noticeofworktype='dog')
        identity_1 = NOWApplicationIdentityFactory(
            now_submission=now_submission_1, mine=mine, submission_only=True)
        now_submission_2 = NOWSubmissionFactory(mine=mine, noticeofworktype='dog')
        identity_2 = NOWApplicationIdentityFactory(
            now_submission=now_submission_2, mine=mine, submission_only=True)
        now_submission_3 = NOWSubmissionFactory(mine=mine, noticeofworktype='cat')
        identity_3 = NOWApplicationIdentityFactory(
            now_submission=now_submission_3, mine=mine, submission_only=True)
        now_submission_4 = NOWSubmissionFactory(mine=mine, noticeofworktype='parrot')
        identity_4 = NOWApplicationIdentityFactory(
            now_submission=now_submission_4, mine=mine, submission_only=True)

        get_resp = test_client.get(
            f'now-applications?mine_guid={mine.mine_guid}&notice_of_work_type_description=dog',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_3, now_submission_4])

    def test_get_mine_application_list_filter_by_multiple_filters(self, test_client, db_session,
                                                                  auth_headers):
        """Should return the records filtered by status, notice_of_work_type_description, and tracking email"""

        mine = MineFactory(minimal=True)
        now_submission_1 = NOWSubmissionFactory(
            mine=mine, status='Rejected', noticeofworktype='dog', trackingnumber=1)
        identity_1 = NOWApplicationIdentityFactory(
            now_submission=now_submission_1, mine=mine, submission_only=True)
        now_submission_2 = NOWSubmissionFactory(
            mine=mine, status='Received', noticeofworktype='cat', trackingnumber=1)
        identity_2 = NOWApplicationIdentityFactory(
            now_submission=now_submission_2, mine=mine, submission_only=True)
        now_submission_3 = NOWSubmissionFactory(
            mine=mine, status='Rejected', noticeofworktype='dog', trackingnumber=12)
        identity_3 = NOWApplicationIdentityFactory(
            now_submission=now_submission_3, mine=mine, submission_only=True)
        now_submission_4 = NOWSubmissionFactory(
            mine=mine, status='Approved', noticeofworktype='cat', trackingnumber=10305)
        identity_4 = NOWApplicationIdentityFactory(
            now_submission=now_submission_4, mine=mine, submission_only=True)

        get_resp = test_client.get(
            f'now-applications?mine_guid={mine.mine_guid}&now_application_status_description=Approved&now_application_status_description=Rejected&notice_of_work_type_description=dog',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x['now_application_guid'],
                                                        get_data['records'])
            for submission in [now_submission_1, now_submission_3])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x['now_application_guid'],
                                                            get_data['records'])
            for submission in [now_submission_2, now_submission_4])
