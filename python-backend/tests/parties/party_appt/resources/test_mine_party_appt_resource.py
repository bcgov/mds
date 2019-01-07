import json
from tests.constants import TEST_MINE_PARTY_APPT_GUID, TEST_MINE_GUID, TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1, TEST_MINE_PARTY_APPT_TYPE_CODE1, TEST_TAILINGS_STORAGE_FACILITY_GUID1


# GET
def test_get_mine_party_appt_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get(
        '/parties/mines?mine_guid=' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert all(mpa['mine_guid'] == TEST_MINE_GUID for mpa in get_data)


def test_post_mine_party_appt_EOR_success(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': 'EOR',
        'related_guid': TEST_TAILINGS_STORAGE_FACILITY_GUID1
    }

    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['mine_guid'] == TEST_MINE_GUID


def test_post_mine_party_appt_EOR_without_TSF(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': 'EOR'
    }

    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_party_appt_success(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': TEST_MINE_PARTY_APPT_TYPE_CODE1
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200


def test_post_mine_party_appt_missing_mine_guid(test_client, auth_headers):
    test_data = {
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': TEST_MINE_PARTY_APPT_TYPE_CODE1
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_party_appt_missing_party_guid(test_client, auth_headers):
    test_data = {
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': TEST_MINE_PARTY_APPT_TYPE_CODE1
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_put_mine_party_appt_success(test_client, auth_headers):
    test_data = {'start_date': '1999-12-12', 'end_date': '2001-01-01'}
    put_resp = test_client.put(
        '/parties/mines/' + TEST_MINE_PARTY_APPT_GUID,
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200


def test_delete_mine_party_appt_success(test_client, auth_headers):
    del_resp = test_client.delete(
        '/parties/mines/' + TEST_MINE_PARTY_APPT_GUID, headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 200


def test_delete_mine_party_appt_invalid_guid(test_client, auth_headers):
    del_resp = test_client.delete(
        '/parties/mines/' + '4108a3fc-3972-409a-bc38-2cc40bc9da34',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404
