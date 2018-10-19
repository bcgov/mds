from datetime import datetime
import json

from tests.constants import TEST_PERMITTEE_GUID, TEST_MINE_GUID, TEST_PERMIT_GUID_1, TEST_PARTY_PER_GUID_3


# GET
def test_get_permittee_not_found(test_client, auth_headers):
    get_resp = test_client.get('/permittees/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Permittee not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_permittee(test_client, auth_headers):
    get_resp = test_client.get('/permittees/' + TEST_PERMITTEE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['permittee_guid'] == TEST_PERMITTEE_GUID
    assert get_resp.status_code == 200


# POST
def test_post_permittee_unexpected_id_in_url(test_client, auth_headers):
    post_resp = test_client.post('/permittees/unexpected_id', headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Error: Unexpected permittee id in Url.'
    assert post_resp.status_code == 400


def test_post_permittee_no_party(test_client, auth_headers):
    data = {
        'permittee_guid': TEST_PERMITTEE_GUID,
        'permit_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Error: Party guid is not provided.'
    assert post_resp.status_code == 400


def test_post_permittee_no_permit(test_client, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permittee_guid': TEST_PERMITTEE_GUID,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Error: Permit guid is not provided.'
    assert post_resp.status_code == 400


def test_post_permittee_no_permittee(test_client, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permit_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Error: Permittee guid is not provided.'
    assert post_resp.status_code == 400


def test_post_permittee_no_permittee_no_effective_date(test_client, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permittee_guid': TEST_PERMITTEE_GUID,
        'permit_guid': TEST_PERMIT_GUID_1,
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Error: Effective date is not provided.'
    assert post_resp.status_code == 400


def test_post_permittee(test_client, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permittee_guid': TEST_PERMITTEE_GUID,
        'permit_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['party_guid'] == TEST_PARTY_PER_GUID_3
    assert post_resp.status_code == 200


def test_post_permittee_permit_guid_not_found(test_client, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permittee_guid': TEST_PERMITTEE_GUID,
        'permit_guid': TEST_MINE_GUID,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Permit not found.'
    assert post_resp.status_code == 400


def test_post_permittee_party_guid_not_found(test_client, auth_headers):
    data = {
        'party_guid': TEST_MINE_GUID,
        'permittee_guid': TEST_PERMITTEE_GUID,
        'permit_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Party not found.'
    assert post_resp.status_code == 400


def test_post_permittee_permittee_guid_not_found(test_client, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permittee_guid': TEST_MINE_GUID,
        'permit_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post('/permittees', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message'] == 'Permittee not found.'
    assert post_resp.status_code == 400
