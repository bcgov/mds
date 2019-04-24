import pytest, json
from datetime import datetime, timedelta
from app.extensions import db
from app.api.mines.incidents.models.mine_incident import MineIncident
from tests.factories import MineFactory


# GET
def test_get_mine_incidents_by_mine_guid(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid
    get_resp = test_client.get(
        f'/mines/{test_mine_guid}/incidents', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_incidents']) > 0
    assert all(i['mine_guid'] == str(test_mine_guid) for i in get_data['mine_incidents'])


def test_get_mine_incidents_by_guid(test_client, db_session, auth_headers):
    test_guid = MineFactory().mine_incidents[0].mine_incident_guid
    get_resp = test_client.get(
        f'/mines/incidents/{test_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['mine_incident_guid'] == str(test_guid)


# POST
def test_post_mine_incidents_happy(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid

    now_time_string = datetime.now().strftime("%Y-%m-%d %H:%M")
    data = {
        'incident_timestamp': now_time_string,
        'incident_description': "Someone got a paper cut",
    }

    post_resp = test_client.post(
        f'/mines/{test_mine_guid}/incidents', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201, post_resp.response

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(test_mine_guid)
    assert post_data['incident_timestamp'] == now_time_string

    #datetime.fromisoformat is in python 3.7
    #assert datetime.fromisoformat(post_data['incident_timestamp']) == datetime.strptime(
    #    data['incident_timestamp'], '%Y-%m-%d %H:%M')
    assert post_data['incident_description'] == data['incident_description']


# PUT
def test_put_mine_incidents_happy(test_client, db_session, auth_headers):
    test_guid = MineFactory().mine_incidents[0].mine_incident_guid

    new_time_string = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    data = {
        'incident_timestamp': new_time_string,
        'incident_description': "Someone got a second paper cut",
    }

    put_resp = test_client.put(
        f'/mines/incidents/{test_guid}', json=data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200, put_resp.response

    put_data = json.loads(put_resp.data.decode())
    assert put_data['incident_timestamp'] == new_time_string

    #datetime.fromisoformat is in python 3.7
    #assert datetime.fromisoformat(post_data['incident_timestamp']) == datetime.strptime(
    #    data['incident_timestamp'], '%Y-%m-%d %H:%M')
    assert put_data['incident_description'] == data['incident_description']
