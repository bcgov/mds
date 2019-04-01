import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.applications.models.application import Application
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.extensions import db
from tests.constants import DUMMY_USER_KWARGS


@pytest.fixture(scope="function")
def setup_info(test_client):
    mine_1 = Mine.create_mine('1234567', 'TestMine', True, 'SW', DUMMY_USER_KWARGS)
    mine_2 = Mine.create_mine('7654321', 'TestingMine', True, 'NW', DUMMY_USER_KWARGS)
    mine_1.save()
    mine_2.save()

    application_1 = Application.create(mine_1.mine_guid, 'TA-1234', 'RIP', '1998-04-30',
                                       'This is a test.')
    application_1.save()

    MINE_1_GUID = str(mine_1.mine_guid)
    MINE_2_GUID = str(mine_2.mine_guid)
    MINE_1_APP_GUID = str(application_1.application_guid)
    NON_EXISTENT_GUID = '8ef23184-02c4-4472-a912-380b5a0d9cae'

    yield dict(
        mine_1_guid=MINE_1_GUID,
        mine_2_guid=MINE_2_GUID,
        bad_guid=NON_EXISTENT_GUID,
        mine_1_application_guid=MINE_1_APP_GUID)

    db.session.query(Application).delete()
    db.session.commit()
    db.session.delete(mine_1)
    db.session.delete(mine_2)
    db.session.commit()


# GET
def test_get_application_not_found(test_client, setup_info, auth_headers):
    get_resp = test_client.get(
        '/applications/' + setup_info.get('bad_guid'), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert 'Not Found' in get_data['message']
    assert get_resp.status_code == 404


def test_get_application(test_client, setup_info, auth_headers):
    get_resp = test_client.get(
        '/applications/' + setup_info.get('mine_1_application_guid'),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['applications']['application_guid'] == setup_info.get('mine_1_application_guid')
    assert get_resp.status_code == 200


def test_get_applications_on_a_mine(test_client, setup_info, auth_headers):
    get_resp = test_client.get(
        '/applications?mine_guid=' + setup_info.get('mine_1_guid'),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 1


#Create
def test_post_application(test_client, setup_info, auth_headers):
    APP_NO = 'TX-54321'
    data = {
        'mine_guid': setup_info.get('mine_2_guid'),
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


def test_post_application_bad_mine_guid(test_client, setup_info, auth_headers):
    data = {'mine_guid': setup_info.get('bad_guid')}
    post_resp = test_client.post(
        '/applications', headers=auth_headers['full_auth_header'], data=data)

    assert post_resp.status_code == 400


#Put
def test_put_application(test_client, setup_info, auth_headers):
    application_guid = setup_info.get('mine_1_application_guid')
    application = Application.find_by_application_guid(application_guid)
    old_app_status = application.application_status_code
    data = {'application_status_code': 'APR'}
    put_resp = test_client.put(
        '/applications/' + application_guid, headers=auth_headers['full_auth_header'], data=data)

    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data.get('application_status_code') == 'APR'
    assert put_data.get('application_status_code') != old_app_status


def test_put_permit_bad_application_guid(test_client, setup_info, auth_headers):
    data = {'application_status_code': 'APR'}
    put_resp = test_client.put(
        '/applications/' + setup_info.get('bad_guid'),
        headers=auth_headers['full_auth_header'],
        data=data)
    assert put_resp.status_code == 404
