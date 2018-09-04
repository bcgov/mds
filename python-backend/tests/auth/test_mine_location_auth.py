from tests.constants import TEST_LOCATION_GUID


# GET Mine Location List Auth
def test_get_mines_by_name_no_auth(test_client):
    get_resp = test_client.get('/mines/location', headers={})
    assert get_resp.status_code == 401


def test_get_mines_by_name_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mines/location', headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mines_by_name_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mines/location', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# Get Mine Location Auth
def test_get_mine_no_auth(test_client):
    get_resp = test_client.get('/mine/location/' + TEST_LOCATION_GUID, headers={})
    assert get_resp.status_code == 401


def test_get_mine_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mine/location/' + TEST_LOCATION_GUID, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mine_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mine/location/' + TEST_LOCATION_GUID, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200
