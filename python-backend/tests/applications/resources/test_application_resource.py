import json
import uuid
import pytest

from tests.factories import ApplicationFactory, MineFactory


# GET
def test_get_application_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/applications/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert 'Not Found' in get_data['message']


def test_get_application(test_client, db_session, auth_headers):
    application_guid = ApplicationFactory().application_guid

    get_resp = test_client.get(
        f'/applications/{application_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['applications']['application_guid'] == str(application_guid)


def test_get_applications_on_a_mine(test_client, db_session, auth_headers):
    mine_guid = ApplicationFactory().mine_guid

    get_resp = test_client.get(
        f'/applications?mine_guid={mine_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 1


#Create
def test_post_application(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    APP_NO = 'TX-54321'
    data = {
        'mine_guid': str(mine_guid),
        'application_no': APP_NO,
        'application_status_code': 'RIP',
        'description': 'This is a test.',
        'received_date': '1999-12-12',
    }
    post_resp = test_client.post(
        '/applications', headers=auth_headers['full_auth_header'], data=data)
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201
    assert len(
        [key for key, value in post_data.items() if key not in data or value != data[key]]) == 2


def test_post_application_bad_mine_guid(test_client, db_session, auth_headers):
    data = {'mine_guid': str(uuid.uuid4())}
    post_resp = test_client.post(
        '/applications', headers=auth_headers['full_auth_header'], data=data)

    assert post_resp.status_code == 400


#Put
def test_put_application(test_client, db_session, auth_headers):
    application_guid = ApplicationFactory(application_status_code='RIP').application_guid

    data = {'application_status_code': 'APR'}
    put_resp = test_client.put(
        f'/applications/{application_guid}', headers=auth_headers['full_auth_header'], data=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data.get('application_status_code') == 'APR'


def test_put_permit_bad_application_guid(test_client, db_session, auth_headers):
    data = {'application_status_code': 'APR'}
    put_resp = test_client.put(
        f'/applications/{uuid.uuid4()}', headers=auth_headers['full_auth_header'], data=data)
    assert put_resp.status_code == 404
