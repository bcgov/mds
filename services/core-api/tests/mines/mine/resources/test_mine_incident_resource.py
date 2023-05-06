import pytest
import json
from datetime import datetime, timedelta
from app.extensions import db
from app.api.incidents.models.mine_incident import MineIncident
from tests.factories import MineFactory
from tests.status_code_gen import SampleDangerousOccurrenceSubparagraphs, RandomIncidentDeterminationTypeCode


# GET
def test_get_mine_incidents_by_mine_guid(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid
    get_resp = test_client.get(
        f'/mines/{test_mine_guid}/incidents', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) > 0
    assert all(i['mine_guid'] == str(test_mine_guid) for i in get_data['records'])


def test_get_mine_incidents_by_guid(test_client, db_session, auth_headers):
    test_mine = MineFactory()
    test_guid = test_mine.mine_incidents[0].mine_incident_guid

    get_resp = test_client.get(
        f'/mines/{test_mine.mine_guid}/incidents/{test_guid}',
        headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_incident_guid'] == str(test_guid)


# POST
def test_post_mine_incidents_happy(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid

    now_time_string = datetime.now().strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'NDO',
        'incident_timestamp': now_time_string,
        'reported_timestamp': now_time_string,
        'incident_description': "Someone got a paper cut",
        'incident_location': 'surface',
        'incident_timezone': 'America/Vancouver'
    }

    post_resp = test_client.post(
        f'/mines/{test_mine_guid}/incidents', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201, post_resp.response

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(test_mine_guid)
    assert post_data['determination_type_code'] == data['determination_type_code']
    assert post_data['incident_location'] == data['incident_location']
    assert post_data['incident_timestamp'] == now_time_string
    assert post_data['incident_timezone'] == data['incident_timezone']

    # datetime.fromisoformat is in python 3.7
    # assert datetime.fromisoformat(post_data['incident_timestamp']) == datetime.strptime(
    #    data['incident_timestamp'], '%Y-%m-%d %H:%M')
    assert post_data['incident_description'] == data['incident_description']


def test_post_mine_incidents_including_optional_fields(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid

    now_time_string = datetime.now().strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'NDO',
        'incident_timestamp': now_time_string,
        'reported_timestamp': now_time_string,
        'incident_description': 'Someone got a paper cut',
        'incident_location': 'surface',
        'incident_timezone': 'America/Vancouver',
        'mine_determination_type_code': 'NDO',
        'mine_determination_representative': 'Billy'
    }

    post_resp = test_client.post(
        f'/mines/{test_mine_guid}/incidents', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201, post_resp.response

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(test_mine_guid)
    assert post_data['determination_type_code'] == data['determination_type_code']
    assert post_data['incident_timestamp'] == now_time_string
    assert post_data['incident_description'] == data['incident_description']
    assert post_data['incident_location'] == data['incident_location']
    assert post_data['incident_timezone'] == data['incident_timezone']
    assert post_data['mine_determination_type_code'] == data['mine_determination_type_code']
    assert post_data['mine_determination_representative'] == data[
        'mine_determination_representative']


def test_post_mine_incidents_dangerous_occurrence_happy(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid

    do_subparagraph_count = 2
    do_ids = [
        sub.compliance_article_id
        for sub in SampleDangerousOccurrenceSubparagraphs(do_subparagraph_count)
    ]

    now_time_string = datetime.now().strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'DO',
        'incident_timestamp': now_time_string,
        'reported_timestamp': now_time_string,
        'incident_description': "Someone got a really bad paper cut",
        'incident_location': 'underground',
        'incident_timezone': 'America/Vancouver'
        'dangerous_occurrence_subparagraph_ids': do_ids
    }

    post_resp = test_client.post(
        f'/mines/{test_mine_guid}/incidents', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201, post_resp.response

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_guid'] == str(test_mine_guid)
    assert post_data['determination_type_code'] == data['determination_type_code']
    assert post_data['incident_timestamp'] == now_time_string
    assert post_data['incident_description'] == data['incident_description']
    assert post_data['incident_location'] == data['incident_location']
    assert post_data['incident_timezone'] == data['incident_timezone']
    assert set(post_data['dangerous_occurrence_subparagraph_ids']) == set(
        data['dangerous_occurrence_subparagraph_ids'])


def test_post_mine_incidents_dangerous_occurrence_no_subs(test_client, db_session, auth_headers):
    test_mine_guid = MineFactory().mine_guid

    now_time_string = datetime.now().strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'DO',
        'incident_timestamp': now_time_string,
        'incident_description': "Someone got a really bad paper cut",
        'incident_location': 'underground',
        'incident_timezone': 'America/Vancouver',
        'dangerous_occurrence_subparagraph_ids': []
    }

    post_resp = test_client.post(
        f'/mines/{test_mine_guid}/incidents', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


# PUT
def test_put_mine_incidents_happy(test_client, db_session, auth_headers):
    test_mine = MineFactory()
    test_guid = test_mine.mine_incidents[0].mine_incident_guid

    new_time_string = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'NDO',
        'incident_timestamp': new_time_string,
        'incident_description': "Someone got a second paper cut",
    }

    put_resp = test_client.put(
        f'/mines/{test_mine.mine_guid}/incidents/{test_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200, put_resp.response

    put_data = json.loads(put_resp.data.decode())
    assert put_data['determination_type_code'] == data['determination_type_code']
    assert put_data['incident_timestamp'] == new_time_string
    assert put_data['incident_description'] == data['incident_description']


def test_put_mine_incidents_including_optional_fields(test_client, db_session, auth_headers):
    test_mine = MineFactory()
    test_guid = test_mine.mine_incidents[0].mine_incident_guid

    new_time_string = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'NDO',
        'incident_timestamp': new_time_string,
        'reported_timestamp': new_time_string,
        'incident_description': 'Someone got a paper cut',
        'mine_determination_type_code': 'NDO',
        'mine_determination_representative': 'Billy'
    }

    put_resp = test_client.put(
        f'/mines/{test_mine.mine_guid}/incidents/{test_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200, put_resp.response

    put_data = json.loads(put_resp.data.decode())
    assert put_data['determination_type_code'] == data['determination_type_code']
    assert put_data['incident_timestamp'] == new_time_string
    assert put_data['incident_description'] == data['incident_description']
    assert put_data['mine_determination_type_code'] == data['mine_determination_type_code']
    assert put_data['mine_determination_representative'] == data[
        'mine_determination_representative']


def test_put_mine_incidents_dangerous_occurrence_happy(test_client, db_session, auth_headers):
    test_mine = MineFactory()
    existing_incident_guid = test_mine.mine_incidents[0].mine_incident_guid

    do_subparagraph_count = 2
    do_ids = [
        sub.compliance_article_id
        for sub in SampleDangerousOccurrenceSubparagraphs(do_subparagraph_count)
    ]

    new_time_string = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'DO',
        'incident_timestamp': new_time_string,
        'incident_description': "Someone got a really bad paper cut",
        'incident_timezone': 'America/Vancouver',
        'dangerous_occurrence_subparagraph_ids': do_ids
    }

    put_resp = test_client.put(
        f'/mines/{test_mine.mine_guid}/incidents/{existing_incident_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200, put_resp.response

    put_data = json.loads(put_resp.data.decode())
    assert put_data['determination_type_code'] == data['determination_type_code']
    assert put_data['incident_timestamp'] == new_time_string
    assert put_data['incident_description'] == data['incident_description']
    assert set(put_data['dangerous_occurrence_subparagraph_ids']) == set(
        data['dangerous_occurrence_subparagraph_ids'])


def test_put_mine_incidents_dangerous_occurrence_no_subs(test_client, db_session, auth_headers):
    test_mine = MineFactory()
    existing_incident_guid = test_mine.mine_incidents[0].mine_incident_guid

    new_time_string = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    data = {
        'determination_type_code': 'DO',
        'incident_timestamp': new_time_string,
        'incident_description': "Someone got a really bad paper cut",
        'incident_location': 'underground',
        'incident_timezone': 'America/Vancouver',
        'dangerous_occurrence_subparagraph_ids': []
    }

    put_resp = test_client.put(
        f'/mines/{test_mine.mine_guid}/incidents/{existing_incident_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400, put_resp.response


    # DELETE
def test_delete_mine_incident(test_client, db_session, auth_headers):
    test_mine = MineFactory()
    test_mine_incident = test_mine.mine_incidents[0]
    test_mine_incident_guid = test_mine_incident.mine_incident_guid

    delete_resp = test_client.delete(
        f'/mines/{test_mine.mine_guid}/incidents/{test_mine_incident_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204