import json
from tests.constants import TEST_MINE_GUID, TEST_MINE_NAME, TEST_MINE_NO, TEST_LAT_1, TEST_LONG_1


def test_get_mines_by_list(test_client, auth_headers):
    get_resp = test_client.get('/mines/search', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'guid': TEST_MINE_GUID,
        'mine_name': TEST_MINE_NAME,
        'mine_no': TEST_MINE_NO,
        'latitude': TEST_LAT_1,
        'longitude': TEST_LONG_1
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_term_name(test_client, auth_headers):
    get_resp = test_client.get('/mines/search?term=mine_name', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'guid': TEST_MINE_GUID,
        'mine_name': TEST_MINE_NAME,
        'mine_no': TEST_MINE_NO,
        'latitude': TEST_LAT_1,
        'longitude': TEST_LONG_1
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_by_name(test_client, auth_headers):
    get_resp = test_client.get('/mines/search?name=mine_name', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'guid': TEST_MINE_GUID,
        'mine_name': TEST_MINE_NAME,
        'mine_no': TEST_MINE_NO,
        'latitude': TEST_LAT_1,
        'longitude': TEST_LONG_1
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context


def test_get_mines_by_list_search_by_permit_no(test_client, auth_headers):
    get_resp = test_client.get('/mines/search?term=TEST56789012', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'guid': TEST_MINE_GUID,
        'mine_name': TEST_MINE_NAME,
        'mine_no': TEST_MINE_NO,
        'latitude': TEST_LAT_1,
        'longitude': TEST_LONG_1
    }
    assert get_resp.status_code == 200
    assert get_data['mines'][0] == context
