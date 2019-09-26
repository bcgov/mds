import json
import uuid
import pytest

from tests.factories import ApplicationFactory, MineFactory, CoreUserFactory


# GET
def test_get_application_not_found(test_client, db_session, auth_headers):
    mine = MineFactory()
    get_resp = test_client.get(f'/mines/{mine.mine_guid}/applications/{uuid.uuid4()}',
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert 'Not Found' in get_data['message']


def test_get_mine_applications(test_client, db_session, auth_headers):
    mine_guid = ApplicationFactory(mine=mine).mine_guid

    get_resp = test_client.get(f'/mines/{mine_guid}/applications',
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 1


#Create
def test_post_application(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    APP_NO = 'TX-54321'
    data = {
        'application_no': APP_NO,
        'application_status_code': 'RIP',
        'description': 'This is a test.',
        'received_date': '1999-12-12',
    }
    post_resp = test_client.post(f'/mines/{mine_guid}/applications',
                                 headers=auth_headers['full_auth_header'],
                                 json=data)
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201
    assert post_data['application_no'] == data['application_no']
    assert post_data['application_status_code'] == data['application_status_code']
    assert post_data['description'] == data['description']
    assert post_data['received_date'] == data['received_date']


def test_post_application_bad_mine_guid(test_client, db_session, auth_headers):
    post_resp = test_client.post(f'/mines/{uuid.uuid4()}/applications',
                                 headers=auth_headers['full_auth_header'],
                                 json=data)

    assert post_resp.status_code == 400


#Put
def test_put_application(test_client, db_session, auth_headers):
    appl = ApplicationFactory(application_status_code='RIP')

    data = {'application_status_code': 'APR'}
    put_resp = test_client.put(f'/mines/{appl.mine_guid}/applications/{application_guid}',
                               headers=auth_headers['full_auth_header'],
                               json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data.get('application_status_code') == 'APR'


def test_put_permit_bad_application_guid(test_client, db_session, auth_headers):
    appl = ApplicationFactory(application_status_code='RIP')
    data = {'application_status_code': 'APR'}
    put_resp = test_client.put(f'/mines/{appl.mine_guid}/applications/{uuid.uuid4()}',
                               headers=auth_headers['full_auth_header'],
                               json=data)
    assert put_resp.status_code == 404
