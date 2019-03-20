import json
from tests.constants import (TEST_MINE_GUID,
                             TEST_PARTY_PER_GUID_1,
                             TEST_PARTY_PER_FIRST_NAME_1,
                             TEST_PARTY_PER_PARTY_NAME_1,
                             TEST_PARTY_PER_FIRST_NAME_2,
                             TEST_PARTY_PER_PARTY_NAME_2)


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

def test_post_person_success(test_client, auth_headers):
    test_person_data = {
        "party_name": "Last",
        "email": "this@test.com",
        "phone_no": "123-456-7890",
        "type": "PER",
        "first_name": "First",
        "suite_no": "1234",
        "address_line_1": "1234 Foo Street",
        "address_line_2": "1234 Bar Blvd",
        "city": "Baz Town",
        "sub_division_code": "BC",
        "post_code": "000000",
        "address_type_code": "CAN"
    }
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['party_name'] == test_person_data['party_name']
    assert post_data['email'] == test_person_data['email']
    assert post_data['phone_no'] == test_person_data['phone_no']
    assert post_data['party_type_code'] == test_person_data['type']
    assert post_data['first_name'] == test_person_data['first_name']

    address = post_data['address'][0]
    assert address['suite_no'] == test_person_data['suite_no']
    assert address['address_line_1'] == test_person_data['address_line_1']
    assert address['address_line_2'] == test_person_data['address_line_2']
    assert address['city'] == test_person_data['city']
    assert address['sub_division_code'] == test_person_data['sub_division_code']
    assert address['post_code'] == test_person_data['post_code']
    assert address['address_type_code'] == test_person_data['address_type_code']


def test_post_company_success(test_client, auth_headers):
    test_person_data = {
        "party_name": "Last",
        "email": "this@test.com",
        "phone_no": "123-456-7890",
        "type": "ORG",
        "suite_no": "1234",
        "address_line_1": "1234 Foo Street",
        "address_line_2": "1234 Bar Blvd",
        "city": "Baz Town",
        "sub_division_code": "BC",
        "post_code": "000000",
        "address_type_code": "CAN"
    }
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['party_name'] == test_person_data['party_name']
    assert post_data['email'] == test_person_data['email']
    assert post_data['phone_no'] == test_person_data['phone_no']
    assert post_data['party_type_code'] == test_person_data['type']

    address = post_data['address'][0]
    assert address['suite_no'] == test_person_data['suite_no']
    assert address['address_line_1'] == test_person_data['address_line_1']
    assert address['address_line_2'] == test_person_data['address_line_2']
    assert address['city'] == test_person_data['city']
    assert address['sub_division_code'] == test_person_data['sub_division_code']
    assert address['post_code'] == test_person_data['post_code']
    assert address['address_type_code'] == test_person_data['address_type_code']


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


def test_put_person_success(test_client, auth_headers):
    test_person_data = {
        "party_name": "Changedlast",
        "email": "new_email_12345@testuser.com",
        "phone_no": "682-732-8490",
        "type": "PER",
        "first_name": "Changedfirst",
        "suite_no": "1234",
        "address_line_1": "1234 Foo Street",
        "address_line_2": "1234 Bar Blvd",
        "city": "Baz Town",
        "sub_division_code": "BC",
        "post_code": "000000",
        "address_type_code": "CAN"
    }
    put_resp = test_client.put('/parties/' + TEST_PARTY_PER_GUID_1, data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['party_name'] == test_person_data['party_name']
    assert put_data['email'] == test_person_data['email']
    assert put_data['phone_no'] == test_person_data['phone_no']
    assert put_data['party_type_code'] == test_person_data['type']
    assert put_data['first_name'] == test_person_data['first_name']

    address = put_data['address'][0]
    assert address['suite_no'] == test_person_data['suite_no']
    assert address['address_line_1'] == test_person_data['address_line_1']
    assert address['address_line_2'] == test_person_data['address_line_2']
    assert address['city'] == test_person_data['city']
    assert address['sub_division_code'] == test_person_data['sub_division_code']
    assert address['post_code'] == test_person_data['post_code']
    assert address['address_type_code'] == test_person_data['address_type_code']

