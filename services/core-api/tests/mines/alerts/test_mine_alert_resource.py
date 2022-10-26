import json
import uuid

from app.api.mines.mine.models.mine import Mine
from tests.factories import MineFactory, MineAlertFactory


class TestGetMineAlert:
    """GET /mines/{mine_guid}/alerts/{mine_alert_guid}"""
    
    def test_get_alerts_vald_mine(self, test_client, db_session, auth_headers):
        """Should return the correct mine alert and a 200 status code"""

        mine_alert = MineAlertFactory()

        get_resp = test_client.get(
            f'/mines/{mine_alert.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['mine_alert_guid'] == str(mine_alert.mine_alert_guid)

    def test_get_alerts_invalid_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine alert guid does not exist"""

        mine = MineFactory()
        fake_guid = uuid.uuid4()

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/alerts/{fake_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404


class TestPutMineAlert:
    """PUT /mines/{mine_guid}/alerts/{mine_alert_guid}"""
    
    def test_put_mine_alert_valid(self, test_client, db_session, auth_headers):
        """Should return the updated mine alert record"""

        mine_alert = MineAlertFactory()
        update_alert_data = {'start_date': '2022-10-30T00:00:00+00:00', 'end_date': '2022-11-14T00:00:00+00:00', 'contact_name': 'Test Mann', 'contact_phone': '211-111-1111', 'message': 'This is a test alert for this test mine!'}

        put_resp = test_client.put(
            f'/mines/{mine_alert.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'], json=update_alert_data)
        put_data = json.loads(put_resp.data.decode())

        assert put_resp.status_code == 200, put_resp.response
        assert put_data['start_date'] == update_alert_data.get('start_date')
        assert put_data['end_date'] == update_alert_data.get('end_date')
        assert put_data['contact_name'] == update_alert_data.get('contact_name')
        assert put_data['contact_phone'] == update_alert_data.get('contact_phone')
        assert put_data['message'] == update_alert_data.get('message')

    def test_put_mine_alert_invalid_body(self, test_client, db_session, auth_headers):
        """Should return a 400 when providing an invalid request body"""

        mine = MineFactory()
        data = {}
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/alerts', headers=auth_headers['full_auth_header'], json=data)

        assert post_resp.status_code == 400


class TestDeleteMineAlert:
    """DELETE /mines/{mine_guid}/alerts/{mine_alert_guid}"""


    def test_delete_mine_alert_valid(self, test_client, db_session, auth_headers):
        """Should return a 204 when the record has been marked deleted"""

        mine_alert = MineAlertFactory.create()

        delete_resp = test_client.delete(f'/mines/{mine_alert.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'])

        assert delete_resp.status_code == 204

    def test_delete_mine_alert_invalid_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine alert guid does not exist"""

        mine = MineFactory()
        fake_guid = uuid.uuid4()

        delete_resp = test_client.delete(
            f'/mines/{mine.mine_guid}/alerts/{fake_guid}',
            headers=auth_headers['full_auth_header'])
        assert delete_resp.status_code == 404