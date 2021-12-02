import json, uuid
from datetime import datetime

from tests.factories import EMLIContactFactory


#GET
def test_get_emli_contact_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(f'/EMLI-contacts/1', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert 'not found' in get_data['message']


def test_get_emli_contact_by_id(test_client, db_session, auth_headers):
    contact_id = EMLIContactFactory().contact_id

    get_resp = test_client.get(
        f'/EMLI-contacts/{contact_id}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['records']['contact_id'] == contact_id


#PUT
def test_put_emli_contact_not_found(test_client, db_session, auth_headers):
    data = {"first_name": "First", "last_name": "Last", "phone_number": "111-111-1111"}
    put_resp = test_client.put(
        f'/EMLI-contacts/1', json=data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 404
    assert 'not found' in put_data['message']


def test_put_emli_contact_success(test_client, db_session, auth_headers):
    contact_id = EMLIContactFactory().contact_id
    data = {
        "first_name": "Mike",
        "last_name": "Doe",
        "phone_number": "111-333-4444",
        "email": "mike.doe@contactme.com",
        "fax_number": "250 000 000",
        "mailing_address_line_1": "PO BOX 1234, Prov Test",
        "mailing_address_line_2": "Vancouver, B.C. VVV VVV"
    }
    put_resp = test_client.put(
        f'/EMLI-contacts/{contact_id}', json=data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['first_name'] == data['first_name']
    assert put_data['last_name'] == data['last_name']
    assert put_data['phone_number'] == data['phone_number']
    assert put_data['email'] == data['email']
    assert put_data['fax_number'] == data['fax_number']
    assert put_data['mailing_address_line_1'] == data['mailing_address_line_1']
    assert put_data['mailing_address_line_2'] == data['mailing_address_line_2']


#DELETE
def test_soft_delete_emli_contact_by_id(test_client, db_session, auth_headers):
    contact_id = EMLIContactFactory().contact_id

    delete_resp = test_client.delete(
        f'/EMLI-contacts/{contact_id}', headers=auth_headers['full_auth_header'])

    get_data = json.loads(delete_resp.data.decode())

    assert get_data['deleted_ind'] == True
