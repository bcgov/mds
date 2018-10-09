import json
from tests.constants import TEST_MINE_NO, TEST_MINE_GUID, TEST_TENURE_ID


# GET
def test_get_mine_not_found(test_client, auth_headers):
    get_resp = test_client.get('/mine/' + 'NOT_FOUND', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Mine not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_mine_by_mine_no(test_client, auth_headers):
    get_resp = test_client.get('/mine/' + TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_detail'][0]['mine_no'] == TEST_MINE_NO
    assert get_resp.status_code == 200


def test_get_mine_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/mine/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['guid'] == TEST_MINE_GUID
    assert get_resp.status_code == 200


# POST
def test_post_mine_invalid_url(test_client, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client.post('/mine/some_mine_no', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unexpected mine number in Url.'
        }
    }
    assert post_resp.status_code == 400


def test_post_mine_no_name(test_client, auth_headers):
    test_mine_data = {}
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: No mine name provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_mine_name_exceed_chars(test_client, auth_headers):
    test_mine_data = {
        "name": "012345678911234567892123456789312345678941234567895123456789512345678961",
        "latitude": "49.2827",
        "longitude": "123.1207"
    }
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Mine name must not exceed 60 characters.'
        }
    }
    assert post_resp.status_code == 400


def test_post_mine_name_only_success(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine2",
    }
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_resp.status_code == 200


def test_post_mine_name_and_note(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_and_note",
        "note": "This is a note",
    }
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_resp.status_code == 200


def test_post_mine_name_and_coord(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "49.2827000",
        "longitude": "123.1207000"
    }
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_resp.status_code == 200


def test_post_mine_success_all(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "note": "This is a note"
    }
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_resp.status_code == 200


# PUT
def test_put_mine_tenure_no_tenure(test_client, auth_headers):
    test_tenure_data = {}
    put_resp = test_client.put('/mine/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: No fields filled.'
        }
    }
    assert put_resp.status_code == 400


def test_put_mine_tenure_mine_not_found(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234568",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put('/mine/' + 'NOT_FOUND', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 404,
            'message': 'Mine not found'
        }
    }
    assert put_resp.status_code == 404


def test_put_mine_tenure_invalid_length(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "12345688",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put('/mine/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Tenure number must be 6 or 7 digits long.'
        }
    }
    assert put_resp.status_code == 400


def test_put_mine_tenure_already_exists(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": TEST_TENURE_ID,
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put('/mine/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Field tenure_id already exists for this mine.'
        }
    }
    assert put_resp.status_code == 400


def test_put_mine_tenure_by_mine_no(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234567",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put('/mine/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['tenure_number_id'] in [x['tenure_number_id'] for x in put_data['mineral_tenure_xref']]
    assert put_resp.status_code == 200


def test_put_mine_tenure_guid(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234599",
        "latitude": "49.2829",
        "longitude": "123.1209"
    }
    put_resp = test_client.put('/mine/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['tenure_number_id'] in [x['tenure_number_id'] for x in put_data['mineral_tenure_xref']]
    assert put_resp.status_code == 200


def test_put_mine_name(test_client, auth_headers):
    test_tenure_data = {
        "name": "name"
    }
    put_resp = test_client.put('/mine/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['name'] in [x['mine_name'] for x in put_data['mine_detail']]
    assert put_resp.status_code == 200


def test_put_mine_note(test_client, auth_headers):
    test_tenure_data = {
        "note": "new_note"
    }
    put_resp = test_client.put('/mine/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['note'] in [x['mine_note'] for x in put_data['mine_detail']]
    assert put_resp.status_code == 200