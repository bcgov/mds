import json

from tests.factories import NOWApplicationFactory, MineFactory
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

    def test_get_now_application_list_filter_by_status(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status"""

        application_1 = NOWApplicationFactory(status='Approved')
        application_2 = NOWApplicationFactory(status='Received')
        application_3 = NOWApplicationFactory(status='Rejected')
        application_4 = NOWApplicationFactory(status='Rejected')

        get_resp = test_client.get(f'now-submissions/applications?status=app,rec',
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

    def test_get_now_application_list_filter_by_noticeofworktype(self, test_client, db_session, auth_headers):
        """Should return the records filtered by noticeofworktype"""

        application_1 = NOWApplicationFactory(noticeofworktype='dog')
        application_2 = NOWApplicationFactory(noticeofworktype='dog')
        application_3 = NOWApplicationFactory(noticeofworktype='cat')
        application_4 = NOWApplicationFactory(noticeofworktype='parrot')

        get_resp = test_client.get(f'now-submissions/applications?noticeofworktype=dog',
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

    def test_get_now_application_list_filter_by_trackingnumber(self, test_client, db_session, auth_headers):
        """Should return the records filtered by trackingnumber"""

        application_1 = NOWApplicationFactory(trackingnumber=1)
        application_2 = NOWApplicationFactory(trackingnumber=1)
        application_3 = NOWApplicationFactory(trackingnumber=12)
        application_4 = NOWApplicationFactory(trackingnumber=10305)

        get_resp = test_client.get(f'now-submissions/applications?trackingnumber=1',
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

    def test_get_now_application_list_filter_by_mine_region(self, test_client, db_session, auth_headers):
        """Should return the records filtered by mine_region"""

        mine = MineFactory(mine_region='SE')
        mine2 = MineFactory(mine_region='NW')
        application_1 = NOWApplicationFactory(mine=mine)
        application_2 = NOWApplicationFactory(mine=mine)
        application_3 = NOWApplicationFactory(mine=mine2)
        application_4 = NOWApplicationFactory(mine=mine2)

        get_resp = test_client.get(f'now-submissions/applications?mine_region={mine.mine_region}',
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

    def test_get_now_application_list_filter_by_multiple_filters(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status, noticeofworktype, and tracking email"""

        application_1 = NOWApplicationFactory(status='Rejected', noticeofworktype='dog', trackingnumber=1)
        application_2 = NOWApplicationFactory(status='Received', noticeofworktype='cat', trackingnumber=1)
        application_3 = NOWApplicationFactory(status='Rejected', noticeofworktype='dog', trackingnumber=12)
        application_4 = NOWApplicationFactory(status='Approved', noticeofworktype='cat', trackingnumber=10305)

        get_resp = test_client.get(
            f'now-submissions/applications?status=app,rej&noticeofworktype=dog&trackingnumber=1',
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
