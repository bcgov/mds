import json
import uuid

from datetime import datetime, timedelta, timezone

from tests.factories import MineFactory, MineAlertFactory


class TestGetMineAlert:
    """GET /mines/{mine_guid}/alerts/{mine_alert_guid}"""

    def test_get_alerts_vald_mine(self, test_client, db_session, auth_headers):
        """Should return the correct mine alert and a 200 status code"""

        mine = MineFactory(minimal=True)
        mine_alert = MineAlertFactory(mine=mine)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'])
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
    FACTORY_DEFAULT_START_DATE = datetime.now(tz=timezone.utc)

    def test_put_mine_alert_valid(self, test_client, db_session, auth_headers):
        """Should return the updated mine alert record and a 200 status code"""

        mine = MineFactory(minimal=True)
        mine_alert = MineAlertFactory(mine=mine)
        update_alert_data = {
            'start_date': mine_alert.start_date.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'end_date': (mine_alert.start_date + timedelta(days=10)).strftime('%Y-%m-%dT%H:%M:%S%z'),
            'contact_name': 'Test Mann - UPDATED',
            'contact_phone': '211-111-1111',
            'message': 'This is a test alert for this test mine! - UPDATED'
        }

        put_resp = test_client.put(
            f'/mines/{mine.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'], json=update_alert_data)
        put_data = json.loads(put_resp.data.decode())

        assert put_resp.status_code == 200, put_resp.response
        assert put_data['contact_name'] == update_alert_data.get('contact_name')
        assert put_data['contact_phone'] == update_alert_data.get('contact_phone')
        assert put_data['message'] == update_alert_data.get('message')

    def test_put_mine_alert_invalid_body(self, test_client, db_session, auth_headers):
        """Should return a 400 when providing an invalid request body"""

        mine = MineFactory(minimal=True)
        mine_alert = MineAlertFactory(mine=mine)
        data = {}
        post_resp = test_client.put(
            f'/mines/{mine.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'], json=data)

        assert post_resp.status_code == 400

    def test_put_mine_alert_not_active_invalid(self, test_client, db_session, auth_headers):
        """Should return a 400 when attempting to update a non active alert"""

        mine = MineFactory(minimal=True)
        mine_alert = MineAlertFactory(mine=mine, set_inactive=True)
        update_alert_data = {
            'start_date': mine_alert.start_date.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'contact_name': 'Test Mann - UPDATED',
            'contact_phone': '211-111-1111',
            'message': 'This is a test alert for this test mine! - UPDATED'
        }

        put_resp = test_client.put(
            f'/mines/{mine.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'], json=update_alert_data)
        put_data = json.loads(put_resp.data.decode())

        assert put_resp.status_code == 400, put_resp.response
        assert 'Cannot update an inactive alert.' in put_data['message']


class TestDeleteMineAlert:
    """DELETE /mines/{mine_guid}/alerts/{mine_alert_guid}"""

    def test_delete_mine_alert_valid(self, test_client, db_session, auth_headers):
        """Should return a 204 when the record has been marked deleted"""

        mine = MineFactory(minimal=True)
        mine_alert = MineAlertFactory(mine=mine)

        delete_resp = test_client.delete(f'/mines/{mine.mine_guid}/alerts/{mine_alert.mine_alert_guid}', headers=auth_headers['full_auth_header'])

        assert delete_resp.status_code == 204

    def test_delete_mine_alert_invalid_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine alert guid does not exist"""

        mine = MineFactory()
        fake_guid = uuid.uuid4()

        delete_resp = test_client.delete(
            f'/mines/{mine.mine_guid}/alerts/{fake_guid}',
            headers=auth_headers['full_auth_header'])
        assert delete_resp.status_code == 404
