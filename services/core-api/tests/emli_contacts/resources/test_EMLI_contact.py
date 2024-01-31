import json, uuid
from datetime import datetime

from flask_restx import marshal
from tests.factories import EMLIContactFactory
from app.api.EMLI_contacts.response_models import EMLI_CONTACT_MODEL


#GET
def test_get_emli_contact_not_found(test_client, db_session, auth_headers):
    fake_guid = uuid.uuid4()
    get_resp = test_client.get(
        f'/EMLI-contacts/{fake_guid}', headers=auth_headers['full_auth_header'])

    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 404
    assert 'not found' in get_data['message']


def test_get_emli_contact_by_guid(test_client, db_session, auth_headers):
    contact = EMLIContactFactory()

    get_resp = test_client.get(
        f'/EMLI-contacts/{contact.contact_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['records'].get('contact_guid', None) == str(contact.contact_guid)


#PUT
def test_put_emli_contact_not_found(test_client, db_session, auth_headers):
    data = {"first_name": "First", "last_name": "Last", "phone_number": "111-111-1111"}
    fake_guid = uuid.uuid4()

    put_resp = test_client.put(
        f'/EMLI-contacts/{fake_guid}', json=data, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 404
    assert 'not found' in put_data['message']


def test_put_emli_contact_success(test_client, db_session, auth_headers):
    contact = EMLIContactFactory()
    data = marshal(contact, EMLI_CONTACT_MODEL)
    data['first_name'] = 'Mike'
    data['last_name'] = 'Doe'
    data['phone_number'] = '111-333-4444'
    data['email'] = 'mike.doe@contactme.com'
    data['fax_number'] = '250 000 000'
    data['mailing_address_line_1'] = 'PO BOX 1234, Prov Test'
    data['mailing_address_line_2'] = 'Vancouver, B.C. VVV VVV'
    data['is_major_mine'] = False
    data['is_general_contact'] = False

    put_resp = test_client.put(
        f'/EMLI-contacts/{contact.contact_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['first_name'] == data['first_name']
    assert put_data['last_name'] == data['last_name']
    assert put_data['phone_number'] == data['phone_number']
    assert put_data['email'] == data['email']
    assert put_data['fax_number'] == data['fax_number']
    assert put_data['mailing_address_line_1'] == data['mailing_address_line_1']
    assert put_data['mailing_address_line_2'] == data['mailing_address_line_2']
    assert put_data['is_major_mine'] == data['is_major_mine']
    assert put_data['is_general_contact'] == data['is_general_contact']


#DELETE
def test_soft_delete_emli_contact_by_guid(test_client, db_session, auth_headers):
    contact = EMLIContactFactory()

    delete_resp = test_client.delete(
        f'/EMLI-contacts/{contact.contact_guid}', headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 204

    get_resp = test_client.get(
        f'/EMLI-contacts/{contact.contact_guid}', headers=auth_headers['full_auth_header'])

    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 404
    assert 'not found' in get_data['message']