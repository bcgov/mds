import json
from ..constants import *


# GET
def test_get_person_no_auth(test_client_with_data):
    get_resp = test_client_with_data.get('/person/' + TEST_PERSON_GUID, headers={})
    assert get_resp.status_code == 401


def test_get_person_view_only(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/person/' + TEST_PERSON_GUID, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_person_full_auth(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/person/' + TEST_PERSON_GUID, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


def test_get_person_not_found(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/person/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'message': 'Person not found'}
    assert get_resp.status_code == 404


def test_get_person(test_client_with_data, auth_headers):
    get_resp = test_client_with_data.get('/person/' + TEST_PERSON_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['person_guid'] == TEST_PERSON_GUID
    assert get_resp.status_code == 200


# POST
def test_post_person_no_auth(test_client_with_data):
    post_resp = test_client_with_data.post('/person', headers={})
    assert post_resp.status_code == 401


def test_post_person_view_only(test_client_with_data, auth_headers):
    post_resp = test_client_with_data.post('/person', headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_person_full_auth(test_client_with_data, auth_headers):
    test_person_data = {"first_name": "FirstAuth", "surname": "LastAuth"}
    post_resp = test_client_with_data.post('/person', data=test_person_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200


def test_post_person_invalid_url(test_client_with_data, auth_headers):
    test_person_data = {"first_name": "First", "surname": "Last"}
    post_resp = test_client_with_data.post('/person/some_id', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': 'Unexpected person id in Url.'}
    assert post_resp.status_code == 400


def test_post_person_no_first_name(test_client_with_data, auth_headers):
    test_person_data = {"surname": "Last"}
    post_resp = test_client_with_data.post('/person', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': 'Must specify a first name.'}
    assert post_resp.status_code == 400


def test_post_person_no_surname(test_client_with_data, auth_headers):
    test_person_data = {"first_name": "First"}
    post_resp = test_client_with_data.post('/person', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {'error': 'Must specify a surname.'}
    assert post_resp.status_code == 400


def test_post_person_name_exists(test_client_with_data, auth_headers):
    test_person_data = {"first_name": TEST_FIRST_NAME, "surname": TEST_SURNAME}
    post_resp = test_client_with_data.post('/person', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())

    assert post_data == {'error': 'Person with the name: {} {} already exists'.format(test_person_data['first_name'], test_person_data['surname'])}
    assert post_resp.status_code == 400


def test_post_person_success(test_client_with_data, auth_headers):
    test_person_data = {"first_name": "First", "surname": "Last"}
    post_resp = test_client_with_data.post('/person', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['first_name'] == test_person_data['first_name']
    assert post_data['surname'] == test_person_data['surname']
    assert post_resp.status_code == 200


# PUT
def test_put_person_no_auth(test_client_with_data):
    put_resp = test_client_with_data.put('/person/' + TEST_PERSON_GUID, headers={})
    assert put_resp.status_code == 401


def test_put_person_view_only(test_client_with_data, auth_headers):
    put_resp = test_client_with_data.put('/person/' + TEST_PERSON_GUID, headers=auth_headers['view_only_auth_header'])
    assert put_resp.status_code == 401


def test_put_person_full_auth(test_client_with_data, auth_headers):
    test_person_data = {"first_name": "first_auth", "surname": "last"}
    put_resp = test_client_with_data.put('/person/' + TEST_PERSON_2_GUID, data=test_person_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


def test_put_person_not_found(test_client_with_data, auth_headers):
    test_person_data = {"first_name": TEST_FIRST_NAME, "surname": TEST_SURNAME}
    put_resp = test_client_with_data.put('/person/' + TEST_MINE_GUID, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    
    assert put_data == {'message': 'Person not found'}
    assert put_resp.status_code == 404


def test_put_person_name_exists(test_client_with_data, auth_headers):
    test_person_data = {"first_name": TEST_FIRST_NAME, "surname": TEST_SURNAME}
    put_resp = test_client_with_data.put('/person/' + TEST_PERSON_GUID, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    
    assert put_data == {'error': 'Person with the name: {} {} already exists'.format(test_person_data['first_name'], test_person_data['surname'])}
    assert put_resp.status_code == 400

def test_put_person_success(test_client_with_data, auth_headers):
    test_person_data = {"first_name": "Changedfirst", "surname": "Changedlast"}
    put_resp = test_client_with_data.put('/person/' + TEST_PERSON_GUID, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['first_name'] == test_person_data['first_name']
    assert put_data['surname'] == test_person_data['surname']
    assert put_resp.status_code == 200