import json
import uuid

from app.api.mines.mine.models.mine import Mine
from tests.factories import MineFactory, MineAlertFactory


class TestGetMineAlerts:
    """GET /mines/{mine_guid}/alerts"""

    def test_get_alerts_vald_mine(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        MineAlertFactory.create_batch(size=batch_size, mine=mine)
        MineAlertFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size

    def test_get_alerts_invalid_mine(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        batch_size = 3
        fake_guid = uuid.uuid4()
        MineAlertFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/mines/{fake_guid}/alerts', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404


class TestPostMineAlerts:
    """POST /mines/{mine_guid}/alerts"""
    
    def test_post_mine_alert_valid(self, test_client, db_session, auth_headers):
        """Should return the new mine alert record"""

        mine = MineFactory() 
        new_alert_data = {'start_date': '2022-10-06T00:00:00+00:00', 'contact_name': 'Test Man', 'contact_phone': '111-111-1111', 'message': 'This is a test alert for this test mine!'}

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=new_alert_data)
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 201, post_resp.response
        assert post_data['start_date'] == new_alert_data.get('start_date')
        assert post_data['contact_name'] == new_alert_data.get('contact_name')
        assert post_data['contact_phone'] == new_alert_data.get('contact_phone')
        assert post_data['message'] == new_alert_data.get('message')

    def test_post_mine_alert_invalid(self, test_client, db_session, auth_headers):
        """Should return a 400 when providing an invalid request body"""

        mine = MineFactory()
        data = {}
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=data)

        assert post_resp.status_code == 400
