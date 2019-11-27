import json, uuid

from tests.factories import PartyFactory
from app.api.utils.custom_reqparser import DEFAULT_MISSING_REQUIRED


# GET
def test_get_person_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(f'/parties/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert 'not found' in get_data['message']


def test_get_person(test_client, db_session, auth_headers):
    party_guid = PartyFactory(person=True).party_guid

    get_resp = test_client.get(f'/parties/{party_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['party_guid'] == str(party_guid)


# POST
def test_post_person_no_first_name(test_client, db_session, auth_headers):
    test_person_data = {
        "party_name": "Last",
        "party_type_code": "PER",
        "phone_no": "123-456-7890",
        "email": "this@test.com"
    }
    post_resp = test_client.post(
        '/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert 'first name' in post_data['message'].lower()


def test_post_person_no_required_party_name(test_client, db_session, auth_headers):
    test_person_data = {
        "first_name": "First",
        "party_type_codetype": "PER",
        "phone_no": "123-456-7890",
        "email": "this@test.com"
    }
    post_resp = test_client.post(
        '/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert DEFAULT_MISSING_REQUIRED in post_data['message']


def test_post_person_no_required_phone_no(test_client, db_session, auth_headers):
    test_person_data = {
        "first_name": "First",
        "party_name": "Last",
        "party_type_codetype": "PER",
        "email": "this@test.com"
    }
    post_resp = test_client.post(
        '/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert DEFAULT_MISSING_REQUIRED in post_data['message']


def test_post_person_success(test_client, db_session, auth_headers):
    test_person_data = {
        "party_name": "Last",
        "email": "this@test.com",
        "phone_no": "123-456-7890",
        "party_type_code": "PER",
        "first_name": "First",
        "suite_no": "1234",
        "address_line_1": "1234 Foo Street",
        "address_line_2": "1234 Bar Blvd",
        "city": "Baz Town",
        "sub_division_code": "BC",
        "post_code": "X0X0X0",
        "address_type_code": "CAN"
    }
    post_resp = test_client.post(
        '/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['party_name'] == test_person_data['party_name']
    assert post_data['email'] == test_person_data['email']
    assert post_data['phone_no'] == test_person_data['phone_no']
    assert post_data['party_type_code'] == test_person_data['party_type_code']
    assert post_data['first_name'] == test_person_data['first_name']

    address = post_data['address'][0]
    assert address['suite_no'] == test_person_data['suite_no']
    assert address['address_line_1'] == test_person_data['address_line_1']
    assert address['address_line_2'] == test_person_data['address_line_2']
    assert address['city'] == test_person_data['city']
    assert address['sub_division_code'] == test_person_data['sub_division_code']
    assert address['post_code'] == test_person_data['post_code']
    assert address['address_type_code'] == test_person_data['address_type_code']


def test_post_company_success(test_client, db_session, auth_headers):
    test_person_data = {
        "party_name": "Last",
        "email": "this@test.com",
        "phone_no": "123-456-7890",
        "party_type_code": "ORG",
        "suite_no": "1234",
        "address_line_1": "1234 Foo Street",
        "address_line_2": "1234 Bar Blvd",
        "city": "Baz Town",
        "sub_division_code": "BC",
        "post_code": "X0X0X0",
        "address_type_code": "CAN"
    }
    post_resp = test_client.post(
        '/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert post_data['party_name'] == test_person_data['party_name']
    assert post_data['email'] == test_person_data['email']
    assert post_data['phone_no'] == test_person_data['phone_no']
    assert post_data['party_type_code'] == test_person_data['party_type_code']

    address = post_data['address'][0]
    assert address['suite_no'] == test_person_data['suite_no']
    assert address['address_line_1'] == test_person_data['address_line_1']
    assert address['address_line_2'] == test_person_data['address_line_2']
    assert address['city'] == test_person_data['city']
    assert address['sub_division_code'] == test_person_data['sub_division_code']
    assert address['post_code'] == test_person_data['post_code']
    assert address['address_type_code'] == test_person_data['address_type_code']


# PUT
def test_put_person_not_found(test_client, db_session, auth_headers):
    test_person_data = {"first_name": 'First', "party_name": 'Last'}
    put_resp = test_client.put(
        f'/parties/{uuid.uuid4()}', data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 404
    assert 'not found' in put_data['message']


def test_put_person_success(test_client, db_session, auth_headers):
    party_guid = PartyFactory(person=True).party_guid

    test_person_data = {
        "party_name": "Changedlast",
        "email": "new_email_12345@testuser.com",
        "phone_no": "682-732-8490",
        "party_type_code": "PER",
        "first_name": "Changedfirst",
        "suite_no": "1234",
        "address_line_1": "1234 Foo Street",
        "address_line_2": "1234 Bar Blvd",
        "city": "Baz Town",
        "sub_division_code": "BC",
        "post_code": "X0X0X0",
        "address_type_code": "CAN"
    }
    put_resp = test_client.put(
        f'/parties/{party_guid}', data=test_person_data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['party_name'] == test_person_data['party_name']
    assert put_data['email'] == test_person_data['email']
    assert put_data['phone_no'] == test_person_data['phone_no']
    assert put_data['party_type_code'] == test_person_data['party_type_code']
    assert put_data['first_name'] == test_person_data['first_name']

    address = put_data['address'][0]
    assert address['suite_no'] == test_person_data['suite_no']
    assert address['address_line_1'] == test_person_data['address_line_1']
    assert address['address_line_2'] == test_person_data['address_line_2']
    assert address['city'] == test_person_data['city']
    assert address['sub_division_code'] == test_person_data['sub_division_code']
    assert address['post_code'] == test_person_data['post_code']
    assert address['address_type_code'] == test_person_data['address_type_code']


# DELETE
def test_delete_person_as_admin(test_client, db_session, auth_headers):
    party_guid = PartyFactory(person=True).party_guid

    delete_resp = test_client.delete(
        f'/parties/{party_guid}', headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204
    get_resp = test_client.get(f'/parties/{party_guid}', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404
