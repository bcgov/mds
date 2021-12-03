import json, uuid
from datetime import datetime

from tests.factories import EMLIContactFactory


#GET
def test_get_all_emli_contacts(test_client, db_session, auth_headers):
    batch_size = 3
    contacts = EMLIContactFactory.create_batch(size=batch_size)

    get_resp = test_client.get(f'/EMLI-contacts', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size


def test_get_emli_contacts_major_mines(test_client, db_session, auth_headers):
    batch_size = 3
    contacts = EMLIContactFactory.create_batch(size=batch_size, major_mine=True)

    get_resp = test_client.get(
        f'/EMLI-contacts?is_major_mine=true', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size


def test_get_emli_contacts_by_mine_region_code(test_client, db_session, auth_headers):
    batch_size = 3
    contacts = EMLIContactFactory.create_batch(size=batch_size, mine_region_code='NE')

    get_resp = test_client.get(f'/EMLI-contacts/NE', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size


def test_post_emli_contacts(test_client, db_session, auth_headers):
    data = {
        'emli_contact_type_code': 'SHI',
        'mine_region_code': 'SW',
        'email': 'test@email.com',
        'phone_number': '250-111-8888',
        'major_mine': True
    }
    post_resp = test_client.post(
        f'/EMLI-contacts', json=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 200


def test_post_no_body(test_client, db_session, auth_headers):
    data = {}

    post_resp = test_client.post(
        f'/EMLI-contacts', headers=auth_headers['full_auth_header'], json=data)
    assert post_resp.status_code == 400
