from datetime import datetime, timedelta, timezone
import json
import uuid

from tests.factories import MineFactory, MineAlertFactory


class TestGetMineAlerts:
    """GET /mines/{mine_guid}/alerts"""

    def test_get_alerts_vald_mine(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 1
        target_mine = MineFactory(minimal=True)
        other_mine = MineFactory(minimal=True)
        MineAlertFactory.create_batch(size=batch_size, mine=target_mine)
        MineAlertFactory.create_batch(size=batch_size, mine=other_mine)

        get_resp = test_client.get(
            f'/mines/{target_mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size

    def test_get_alerts_invalid_mine(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        batch_size = 1
        fake_guid = uuid.uuid4()
        mine = MineFactory(minimal=True)
        MineAlertFactory.create_batch(size=batch_size, mine=mine)

        get_resp = test_client.get(
            f'/mines/{fake_guid}/alerts', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404


class TestPostMineAlerts:
    """POST /mines/{mine_guid}/alerts"""
    FACTORY_DEFAULT_START_DATE = datetime.now(tz=timezone.utc)

    def test_post_mine_alert_valid(self, test_client, db_session, auth_headers):
        """Should return the new mine alert record and a 201 status code"""

        mine = MineFactory(minimal=True)
        start_date = (self.FACTORY_DEFAULT_START_DATE + timedelta(days=5)).strftime('%Y-%m-%dT%H:%M:%S%z')
        new_alert_data = {
            'start_date': start_date,
            'contact_name': 'Test Man',
            'contact_phone': '111-111-1111',
            'message': 'This is a test alert for this test mine!'
        }

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=new_alert_data)
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 201
        assert post_data['contact_name'] == new_alert_data.get('contact_name')
        assert post_data['contact_phone'] == new_alert_data.get('contact_phone')
        assert post_data['message'] == new_alert_data.get('message')

    def test_post_mine_alert_future_alert_with_active_invalid(self, test_client, db_session, auth_headers):
        """Should return a 400 when providing a start date in the future when an active alert is present on the mine"""

        mine = MineFactory(minimal=True)
        MineAlertFactory(mine=mine)
        start_date = (datetime.now(tz=timezone.utc) + timedelta(days=5)).strftime('%Y-%m-%dT%H:%M:%S%z')
        new_alert_data = {
            'start_date': start_date,
            'contact_name': 'Test Man',
            'contact_phone': '111-111-1111',
            'message': 'This is a test alert for this test mine!'
        }

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=new_alert_data)
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 400, post_resp.response
        assert 'Cannot create an alert with a start date in the future with an existing active alert.' in post_data['message']

    def test_post_mine_alert_invalid_body(self, test_client, db_session, auth_headers):
        """Should return a 400 when providing an invalid request body"""

        mine = MineFactory()
        data = {}
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=data)

        assert post_resp.status_code == 400

    def test_post_mine_alert_historic_invalid(self, test_client, db_session, auth_headers):
        """Should return a 400 when providing a start date that lies before a historic alert start date"""

        mine = MineFactory(minimal=True)
        MineAlertFactory(mine=mine)
        invalid_start_date = (self.FACTORY_DEFAULT_START_DATE - timedelta(days=3)).strftime('%Y-%m-%dT%H:%M:%S%z')
        data = {'start_date': invalid_start_date, 'contact_name': 'Test Man', 'contact_phone': '111-111-1111', 'message': 'This is a test alert for this test mine!'}
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=data)
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 400, post_resp.response
        assert 'Start date cannot come before a historic alert. Please check history for more details.' in post_data['message']
