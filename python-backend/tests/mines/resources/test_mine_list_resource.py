import json
from tests.constants import TEST_MINE_GUID


def test_get_mines(test_client, auth_headers):
    get_resp = test_client.get('/mines', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['mines'][0]['guid'] == TEST_MINE_GUID


def test_get_mines_with_map_true(test_client, auth_headers):
    get_resp = test_client.get('/mines?map=true', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['mines'][0]['guid'] == TEST_MINE_GUID


def test_get_mines_empty(test_client, auth_headers):
    get_resp = test_client.get('/mines?page=2', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mines': [],
        'current_page': 2,
        'total_pages': 1,
        'items_per_page': 1,
        'total': 1
    }
    assert get_resp.status_code == 200
    assert get_data == context


def test_get_mines_empty_with_per_page(test_client, auth_headers):
    get_resp = test_client.get('/mines?page=2&per_page=10', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mines': [],
        'current_page': 2,
        'total_pages': 1,
        'items_per_page': 1,
        'total': 1
    }
    assert get_resp.status_code == 200
    assert get_data == context
