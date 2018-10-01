from datetime import datetime, timedelta
import json

from app.mines.models.party import MgrAppointment
from tests.constants import TEST_MINE_GUID, TEST_MANAGER_GUID, TEST_PERSON_2_GUID


# GET
def test_get_manager_not_found(test_client, auth_headers):
    get_resp = test_client.get('/manager/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Manager not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_manager(test_client, auth_headers):
    get_resp = test_client.get('/manager/' + TEST_MANAGER_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mgr_appointment_guid'] == TEST_MANAGER_GUID
    assert get_resp.status_code == 200


# POST
def test_post_manager_invalid_url(test_client, auth_headers):
    post_resp = test_client.post('/manager/some_id', data={}, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unexpected manager id in Url.'
        }
    }
    assert post_resp.status_code == 400


def test_post_no_party_guid(test_client, auth_headers):
    test_manager_data = {"mine_guid": TEST_MINE_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d"), "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party guid is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_no_mine_guid(test_client, auth_headers):
    test_manager_data = {"party_guid": TEST_PERSON_2_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d"), "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Mine guid is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_no_effective_date(test_client, auth_headers):
    test_manager_data = {"mine_guid": TEST_MINE_GUID, "party_guid": TEST_PERSON_2_GUID, "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Effective date is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_person_does_not_exist(test_client, auth_headers):
    test_manager_data = {"mine_guid": TEST_MINE_GUID, "party_guid": TEST_MINE_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d"), "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party with guid: {}, does not exist.'.format(test_manager_data['party_guid'])
        }
    }
    assert post_resp.status_code == 400


def test_post_mine_does_not_exist(test_client, auth_headers):
    test_manager_data = {"mine_guid": TEST_PERSON_2_GUID, "party_guid": TEST_PERSON_2_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d"), "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Mine with guid: {}, does not exist.'.format(test_manager_data['mine_guid'])
        }
    }
    assert post_resp.status_code == 400


def test_post_manager_success(test_client, auth_headers):
    test_manager_data = {"party_guid": TEST_PERSON_2_GUID, "mine_guid": TEST_MINE_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    previous_manager = MgrAppointment.find_by_mgr_appointment_guid(TEST_MANAGER_GUID)
    expiry_date = datetime.today() - timedelta(days=1)
    assert previous_manager.expiry_date == expiry_date.date()
    assert post_data['party_guid'] == test_manager_data['party_guid']
    assert post_data['mine_guid'] == test_manager_data['mine_guid']
    assert post_resp.status_code == 200
