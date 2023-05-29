import json
import uuid

from tests.factories import MineIncidentFactory, MineFactory


class TestGetMineIncidents:
    """GET /mines/{mine_guid}/incidents"""
    def test_get_incidents_for_a_mine(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 staus code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        MineIncidentFactory.create_batch(size=batch_size, mine=mine)
        MineIncidentFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/incidents', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size

    def test_get_incidents_non_existent_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        batch_size = 3
        fake_guid = uuid.uuid4()
        MineIncidentFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/mines/{fake_guid}/incidents', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 404


class TestPostMineIncident:
    """POST /mines/{mine_guid}/incidents"""
    def test_post_mine_incident(self, test_client, db_session, auth_headers):
        """Should return the new mine incident record"""

        mine = MineFactory()
        incident = MineIncidentFactory(mine=mine)
        test_incident_data = {
            'incident_timestamp': '2019-01-01T18:17:12.136000+00:00',
            'reported_timestamp': '2019-01-01T18:27:12.136000+00:00',
            'incident_description': incident.incident_description,
            'incident_location': incident.incident_location,
            'incident_timezone': incident.incident_timezone
        }
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/incidents',
            json=test_incident_data,
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 201, post_resp.response
        assert post_data['incident_timestamp'] == test_incident_data['incident_timestamp']
        assert post_data['incident_timezone'] == test_incident_data['incident_timezone']
        assert post_data['incident_description'] == test_incident_data['incident_description']
        assert post_data['incident_location'] == test_incident_data['incident_location']
        assert post_data['reported_timestamp'] == str(test_incident_data['reported_timestamp'])
