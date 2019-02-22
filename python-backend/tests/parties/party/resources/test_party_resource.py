import json
from tests.constants import TEST_MINE_GUID, TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1


# GET
def test_get_person_not_found(test_client, auth_headers):
    get_resp = test_client.get('/parties/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Party not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_person(test_client, auth_headers):
    get_resp = test_client.get('/parties/' + TEST_PARTY_PER_GUID_1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['party_guid'] == TEST_PARTY_PER_GUID_1
    assert get_resp.status_code == 200


# POST
def test_post_person_invalid_url(test_client, auth_headers):
    test_person_data = {"first_name": "First", "party_name": "Last"}
    post_resp = test_client.post('/parties/some_id', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unexpected party id in Url.'
        }
    }
    assert post_resp.status_code == 400


def test_post_person_no_first_name(test_client, auth_headers):
    test_person_data = {"party_name": "Last", "type": "PER", "phone_no": "123-456-7890", "email": "this@test.com"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Person first name is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_person_no_surname(test_client, auth_headers):
    test_person_data = {"first_name": "First", "type": "PER", "phone_no": "123-456-7890", "email": "this@test.com"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party name is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_person_no_phone_no(test_client, auth_headers):
    test_person_data = {"first_name": "First", "party_name": "Last", "type": "PER", "email": "this@test.com"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party phone number is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_person_no_email(test_client, auth_headers):
    test_person_data = {"first_name": "First", "party_name": "Last", "type": "PER", "phone_no": "123-456-7890"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party email is not provided.'
        }
    }
    assert post_resp.status_code == 400


def test_post_person_name_exists(test_client, auth_headers):
    test_person_data = {"first_name": TEST_PARTY_PER_FIRST_NAME_1, "party_name": TEST_PARTY_PER_PARTY_NAME_1, "email": "this@test.com", "phone_no": "123-456-7890", "type": "PER"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())

    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party with the name: {} {} already exists'.format(test_person_data['first_name'], test_person_data['party_name'])
        }
    }
    assert post_resp.status_code == 400


def test_post_person_success(test_client, auth_headers):
    test_person_data = {"first_name": "First", "party_name": "Last", "email": "this@test.com", "phone_no": "123-456-7890", "type": "PER"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['first_name'] == test_person_data['first_name']
    assert post_data['party_name'] == test_person_data['party_name']
    assert post_resp.status_code == 200


def test_post_company_success(test_client, auth_headers):
    test_person_data = {"party_name": "Last", "email": "this@test.com", "phone_no": "123-456-7890", "type": "ORG"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_data['party_name'] == test_person_data['party_name']
    assert post_resp.status_code == 200


# PUT
def test_put_person_not_found(test_client, auth_headers):
    test_person_data = {"first_name": TEST_PARTY_PER_FIRST_NAME_1, "party_name": TEST_PARTY_PER_PARTY_NAME_1}
    put_resp = test_client.put('/parties/' + TEST_MINE_GUID, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 404,
            'message': 'Party not found'
        }
    }
    assert put_resp.status_code == 404


def test_put_person_name_exists(test_client, auth_headers):
    test_person_data = {"first_name": TEST_PARTY_PER_FIRST_NAME_1, "party_name": TEST_PARTY_PER_PARTY_NAME_1, "type": "PER"}
    put_resp = test_client.put('/parties/' + TEST_PARTY_PER_GUID_1, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Party with the name: {} {} already exists'.format(test_person_data['first_name'], test_person_data['party_name'])
        }
    }
    assert put_resp.status_code == 400


def test_put_person_success(test_client, auth_headers):
    test_person_data = {"first_name": "Changedfirst", "party_name": "Changedlast", "type": "PER"}
    put_resp = test_client.put('/parties/' + TEST_PARTY_PER_GUID_1, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_data['first_name'] == test_person_data['first_name']
    assert put_data['party_name'] == test_person_data['party_name']
    assert put_resp.status_code == 200
