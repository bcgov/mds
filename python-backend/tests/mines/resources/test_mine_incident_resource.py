import pytest, json
from datetime import datetime
from app.extensions import db
from app.api.mines.incidents.models.mine_incident import MineIncident
from tests.factories import MineFactory


@pytest.fixture(scope="function")
def setup_info(test_client):
    mine = MineFactory()
    yield dict(mine=mine)


# GET
def test_get_mine_incidents_by_mine_guid(test_client, db_session, auth_headers, setup_info):
    test_mine_guid = setup_info["mine"].mine_guid
    get_resp = test_client.get(
        f'/mines/{test_mine_guid}/incidents', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_incidents']) > 0
    assert all(i['mine_guid'] == str(test_mine_guid) for i in get_data['mine_incidents'])


def test_get_mine_incidents_by_guid(test_client, db_session, auth_headers, setup_info):
    test_guid = setup_info["mine"].mine_incidents[0].mine_incident_guid
    get_resp = test_client.get(
        f'/mines/incidents/{test_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['mine_incident_guid'] == str(test_guid)


# POST
def test_post_mine_incidents_happy(test_client, db_session, auth_headers, setup_info):
    test_mine_guid = setup_info["mine"].mine_guid

    now = datetime.now()
    data = {
        'incident_timestamp': now.strftime("%Y-%m-%d %H:%M"),
        'incident_description': "Someone got a paper cut",
    }

    post_resp = test_client.post(
        f'/mines/{test_mine_guid}/incidents', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201, post_resp.response

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(test_mine_guid)
    assert post_data['incident_timestamp'] == now.isoformat(timespec='minutes') + ':00+00:00'

    #datetime.fromisoformat is in python 3.7
    #assert datetime.fromisoformat(post_data['incident_timestamp']) == datetime.strptime(
    #    data['incident_timestamp'], '%Y-%m-%d %H:%M')
    assert post_data['incident_description'] == data['incident_description']
