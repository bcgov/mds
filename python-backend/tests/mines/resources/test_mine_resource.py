import json
from tests.constants import (TEST_MINE_NO, TEST_MINE_GUID, TEST_TENURE_ID, TEST_REGION_CODE)


# GET
def test_get_mine_not_found(test_client, auth_headers):
    get_resp = test_client.get('/mines/' + 'NOT_FOUND', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'error': {'status': 404, 'message': 'Mine not found'}}
    assert get_resp.status_code == 404


def test_get_mine_by_mine_no(test_client, auth_headers):
    get_resp = test_client.get('/mines/' + TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_no'] == TEST_MINE_NO
    assert get_resp.status_code == 200


def test_get_mine_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/mines/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['guid'] == TEST_MINE_GUID
    assert get_resp.status_code == 200


# POST
def test_post_mine_invalid_url(test_client, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client.post(
        '/mines/some_mine_no', data=test_mine_data, headers=auth_headers['full_auth_header'])
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
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': {'status': 400, 'message': 'Error: No mine name provided.'}}
    assert post_resp.status_code == 400


def test_post_mine_name_exceed_chars(test_client, auth_headers):
    test_mine_data = {
        "name": "012345678911234567892123456789312345678941234567895123456789512345678961",
        "latitude": "49.2827",
        "longitude": "123.1207"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Mine name must not exceed 60 characters.'
        }
    }
    assert post_resp.status_code == 400


def test_post_mine_name_only_success(test_client, auth_headers):
    test_mine_data = {"name": "test_create_mine2", "mine_region": "SW"}
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_resp.status_code == 200


def test_post_mine_name_and_note(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_and_note",
        "note": "This is a note",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_resp.status_code == 200


def test_post_mine_name_and_coord(test_client, auth_headers):
    # the tests test_post_mine_redundant_name and test_put_redundant_mine_name rely on this mine
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_resp.status_code == 200


def test_post_mine_success_all(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_2",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "note": "This is a note",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_resp.status_code == 200


def test_post_mine_redundant_name(test_client, auth_headers):
    # This test relies on test_post_mine_name_and_coord
    test_mine_data = {
        "name": "test_create_mine",
        "latitude": "44.2827000",
        "longitude": "126.1207000",
        "note": "This is a new note",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400

def test_post_mine_major_invalid_input(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_major",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "note": "This is a note",
        "major_mine_ind": "blah",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_major_true(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_major",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "note": "This is a note",
        "major_mine_ind": "true",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_data['major_mine_ind'] == True
    assert post_resp.status_code == 200


def test_post_mine_major_false(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_major_2",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "note": "This is a note",
        "major_mine_ind": "false",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_data['major_mine_ind'] == False
    assert post_resp.status_code == 200


def test_post_mine_mine_status(test_client, auth_headers):
    test_mine_data = {
        "name": "test_create_mine_status",
        "latitude": "49.2827000",
        "longitude": "123.1207000",
        "note": "This is a note",
        "mine_status": "CLD, CM",
        "mine_region": "SW"
    }
    post_resp = test_client.post(
        '/mines', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_data['latitude'] == test_mine_data['latitude']
    assert post_data['longitude'] == test_mine_data['longitude']
    assert post_data['mine_note'] == test_mine_data['note']
    assert post_data['mine_region'] == test_mine_data['mine_region']
    assert post_resp.status_code == 200


# PUT
def test_put_mine_tenure_no_tenure(test_client, auth_headers):
    test_tenure_data = {}
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'error': {'status': 400, 'message': 'Error: No fields filled.'}}
    assert put_resp.status_code == 400


def test_put_mine_tenure_mine_not_found(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234568",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put(
        '/mines/' + 'NOT_FOUND', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'error': {'status': 404, 'message': 'Mine not found'}}
    assert put_resp.status_code == 404


def test_put_mine_tenure_invalid_length(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "12345688",
        "latitude": "49.2828",
        "longitude": "123.1208"
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
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
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
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
        "longitude": "123.1208",
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['tenure_number_id'] in [
        x['tenure_number_id'] for x in put_data['mineral_tenure_xref']
    ]
    assert put_resp.status_code == 200


def test_put_mine_tenure_guid(test_client, auth_headers):
    test_tenure_data = {
        "tenure_number_id": "1234599",
        "latitude": "49.2829",
        "longitude": "123.1209",
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['tenure_number_id'] in [
        x['tenure_number_id'] for x in put_data['mineral_tenure_xref']
    ]
    assert put_resp.status_code == 200


def test_put_mine_name(test_client, auth_headers):
    test_tenure_data = {
        "name": "name",
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['name'] == put_data['mine_name']
    assert put_resp.status_code == 200


def test_put_redundant_mine_name(test_client, auth_headers):
    # this relies on  test test_post_mine_name_and_coord
    test_tenure_data = {
        "name": "test_create_mine",
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400


def test_put_mine_major_true(test_client, auth_headers):
    test_mine_data = {
        "major_mine_ind": "true",
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_mine_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['major_mine_ind'] == True
    assert put_resp.status_code == 200


def test_put_mine_major_false(test_client, auth_headers):
    test_mine_data = {
        "major_mine_ind": "false",
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_mine_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['major_mine_ind'] == False
    assert put_resp.status_code == 200


def test_put_mine_note(test_client, auth_headers):
    test_tenure_data = {"note": "new_note"}
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data['note'] == put_data['mine_note']
    assert put_resp.status_code == 200


def test_put_mine_mine_status(test_client, auth_headers):
    test_mine_data = {
        "mine_status": "CLD, CM",
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


def test_put_mine_region(test_client, auth_headers):
    test_mine_data = {
        "mine_region": TEST_REGION_CODE,
        "note": ""
    }
    put_resp = test_client.put(
        '/mines/' + TEST_MINE_GUID, data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200
    put_data = json.loads(put_resp.data.decode())
    assert put_data['region_code'] == test_mine_data['mine_region']
