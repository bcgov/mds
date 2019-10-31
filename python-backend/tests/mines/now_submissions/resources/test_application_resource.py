import json

from tests.factories import MineFactory, NOWSubmissionFactory


class TestGetMineApplicationResource:
    """GET mines/{mine_guid}/now-submissions/applications"""

    def test_get_mine_application_list_success(self, test_client, db_session, auth_headers):
        """Should return the records for the mine with a 200 response code"""

        batch_size = 5
        other_applications = NOWSubmissionFactory.create_batch(size=batch_size)
        mine = MineFactory(minimal=True)
        application_1 = NOWSubmissionFactory(mine=mine)
        application_2 = NOWSubmissionFactory(mine=mine)

        get_resp = test_client.get(f'mines/{mine.mine_guid}/now-submissions/applications',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(application.application_guid) not in map(lambda x: x['application_guid'], get_data['records'])
            for application in other_applications)
        assert all(
            str(application.application_guid) in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_1, application_2])

    def test_get_mine_application_list_filter_by_status(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status"""

        mine = MineFactory(minimal=True)
        application_1 = NOWSubmissionFactory(mine=mine, status='Approved')
        application_2 = NOWSubmissionFactory(mine=mine, status='Received')
        application_3 = NOWSubmissionFactory(mine=mine, status='Rejected')
        application_4 = NOWSubmissionFactory(mine=mine, status='Rejected')

        get_resp = test_client.get(f'mines/{mine.mine_guid}/now-submissions/applications?status=app,rec',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(application.application_guid) in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_1, application_2])
        assert all(
            str(application.application_guid) not in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_3, application_4])

    def test_get_mine_application_list_filter_by_noticeofworktype(self, test_client, db_session, auth_headers):
        """Should return the records filtered by noticeofworktype"""

        mine = MineFactory(minimal=True)
        application_1 = NOWSubmissionFactory(mine=mine, noticeofworktype='dog')
        application_2 = NOWSubmissionFactory(mine=mine, noticeofworktype='dog')
        application_3 = NOWSubmissionFactory(mine=mine, noticeofworktype='cat')
        application_4 = NOWSubmissionFactory(mine=mine, noticeofworktype='parrot')

        get_resp = test_client.get(f'mines/{mine.mine_guid}/now-submissions/applications?noticeofworktype=dog',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(application.application_guid) in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_1, application_2])
        assert all(
            str(application.application_guid) not in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_3, application_4])

    def test_get_mine_application_list_filter_by_trackingnumber(self, test_client, db_session, auth_headers):
        """Should return the records filtered by trackingnumber"""

        mine = MineFactory(minimal=True)
        application_1 = NOWSubmissionFactory(mine=mine, trackingnumber=1)
        application_2 = NOWSubmissionFactory(mine=mine, trackingnumber=1)
        application_3 = NOWSubmissionFactory(mine=mine, trackingnumber=12)
        application_4 = NOWSubmissionFactory(mine=mine, trackingnumber=10305)

        get_resp = test_client.get(f'mines/{mine.mine_guid}/now-submissions/applications?trackingnumber=1',
                                   headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(
            str(application.application_guid) in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_1, application_2])
        assert all(
            str(application.application_guid) not in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_3, application_4])

    def test_get_mine_application_list_filter_by_multiple_filters(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status, noticeofworktype, and tracking email"""

        mine = MineFactory(minimal=True)
        application_1 = NOWSubmissionFactory(mine=mine, status='Rejected', noticeofworktype='dog', trackingnumber=1)
        application_2 = NOWSubmissionFactory(mine=mine, status='Received', noticeofworktype='cat', trackingnumber=1)
        application_3 = NOWSubmissionFactory(mine=mine, status='Rejected', noticeofworktype='dog', trackingnumber=12)
        application_4 = NOWSubmissionFactory(mine=mine, status='Approved', noticeofworktype='cat', trackingnumber=10305)

        get_resp = test_client.get(
            f'mines/{mine.mine_guid}/now-submissions/applications?status=app,rej&noticeofworktype=dog&trackingnumber=1',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())

        assert get_resp.status_code == 200
        assert len(get_data['records']) == 1
        assert all(
            str(application.application_guid) in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_1])
        assert all(
            str(application.application_guid) not in map(lambda x: x['application_guid'], get_data['records'])
            for application in [application_2, application_3, application_4])
