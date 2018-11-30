from tests.constants import TEST_MINE_NO, TEST_MINE_TENURE_TYPE_ID_1


# GET Mine List Auth
def test_get_mines_no_auth(test_client):
    get_resp = test_client.get('/mines', headers={})
    assert get_resp.status_code == 401


def test_get_mines_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mines', headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mines_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mines', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# GET Mine List By Name Auth
def test_get_mines_by_name_no_auth(test_client):
    get_resp = test_client.get('/mines/names', headers={})
    assert get_resp.status_code == 401


def test_get_mines_by_name_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mines/names', headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mines_by_name_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mines/names', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# Get Mine Auth
def test_get_mine_no_auth(test_client):
    get_resp = test_client.get('/mines/' + TEST_MINE_NO, headers={})
    assert get_resp.status_code == 401


def test_get_mine_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mines/' + TEST_MINE_NO, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mine_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mines/' + TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# POST Mine Auth
def test_post_mine_no_auth(test_client):
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "49.49",
        "longitude": "123.124"
    }
    post_resp = test_client.post('/mines', data=test_mine_data, headers={})
    assert post_resp.status_code == 401


def test_post_mine_view_only(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "49.49",
        "longitude": "123.124"
    }
    post_resp = test_client.post('/mines', data=test_mine_data, headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_mine_full_auth(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "49.49",
        "longitude": "123.124",
        "mine_region": "NE",
        "mine_tenure_type_id": TEST_MINE_TENURE_TYPE_ID_1
    }
    post_resp = test_client.post('/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200


# PUT Mine Auth
def test_put_mine_no_auth(test_client):
    test_tenure_data = {
        "tenure_number_id": "1234568",
        "latitude": "49.49",
        "longitude": "123.123"
    }
    put_resp = test_client.put('/mines/' + TEST_MINE_NO, data=test_tenure_data, headers={})
    assert put_resp.status_code == 401


def test_put_mine_view_only(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234568",
        "latitude": "49.49",
        "longitude": "123.123"
    }
    put_resp = test_client.put('/mines/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['view_only_auth_header'])
    assert put_resp.status_code == 401


def test_put_mine_full_auth(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234568",
        "latitude": "49.49",
        "longitude": "123.125"
    }
    put_resp = test_client.put('/mines/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200
