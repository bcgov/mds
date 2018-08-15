import json
from ..constants import *


# GET
def test_get_mine_no_auth(test_client_with_data):
    get_resp = test_client_with_data.get('/mine/' +  TEST_MINE_NO, headers={})
    assert get_resp.status_code == 401


def test_get_mine_view_only(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/mine/' +  TEST_MINE_NO, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mine_full_auth(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/mine/' +  TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


def test_get_mine_not_found(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/mine/' +  'NOT_FOUND', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'message': 'Mine not found'}
    assert get_resp.status_code == 404


def test_get_mine_success(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/mine/' +  TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_detail'][0]['mine_no'] == TEST_MINE_NO
    assert get_resp.status_code == 200


# POST
def test_post_mine_no_auth(test_client_with_data):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client_with_data.post('/mine', data=test_mine_data, headers={})
    assert post_resp.status_code == 401


def test_post_mine_view_only(test_client_with_data, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client_with_data.post('/mine', data=test_mine_data, headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_mine_full_auth(test_client_with_data, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client_with_data.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200


def test_post_mine_invalid_url(test_client_with_data, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client_with_data.post('/mine/some_mine_no', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': 'Unexpected mine number in Url.'}
    assert post_resp.status_code == 400


def test_post_mine_no_name(test_client_with_data, auth_headers):
    test_mine_data = {}
    post_resp = test_client_with_data.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': 'Must specify a name.'}
    assert post_resp.status_code == 400


def test_post_mine_no_name(test_client_with_data, auth_headers):
    test_mine_data = {"name": "012345678911234567892123456789312345678941234567895123456789512345678961"}
    post_resp = test_client_with_data.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': 'Specified name exceeds 60 characters.'}
    assert post_resp.status_code == 400


def test_post_mine_success(test_client_with_data, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client_with_data.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_name'] == test_mine_data['name']
    assert post_resp.status_code == 200


# PUT
def test_put_mine_no_auth(test_client_with_data):
    test_tenure_data = {'tenure_number_id': '1234567'}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers={})
    assert put_resp.status_code == 401


def test_put_mine_view_only(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': '1234567'}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['view_only_auth_header'])
    assert put_resp.status_code == 401


def test_put_mine_full_auth(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': '1234568'}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


def test_put_mine_tenure_no_tenure(test_client_with_data, auth_headers):
    test_tenure_data = {}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'error': 'Must specify tenure_id.'}
    assert put_resp.status_code == 400


def test_put_mine_tenure_mine_not_found(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': '1234568'}
    put_resp = test_client_with_data.put('/mine/' +  'NOT_FOUND', data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'message': 'Mine not found'}
    assert put_resp.status_code == 404


def test_put_mine_tenure_invalid_characters(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': 'rewrewr'}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'error': 'Field tenure_id must contain only digits.'}
    assert put_resp.status_code == 400


def test_put_mine_tenure_invalid_length(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': '12345688'}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'error': 'Field tenure_id must be exactly 7 digits long.'}
    assert put_resp.status_code == 400


def test_put_mine_tenure_already_exists(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': TEST_TENURE_ID}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {'error': 'Field tenure_id already exists for this mine'}
    assert put_resp.status_code == 400


def test_put_mine_tenure_success(test_client_with_data, auth_headers):
    test_tenure_data = {'tenure_number_id': '1234567'}
    put_resp = test_client_with_data.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert test_tenure_data in put_data['mineral_tenure_xref']
    assert put_resp.status_code == 200