import json, uuid
from datetime import datetime

from tests.factories import MinistryContactFactory


def test_get_all_ministry_contacts(test_client, db_session, auth_headers):
    get_resp = test_client.get(f'/ministry-contacts', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    init_records_count = len(get_data['records'])

    batch_size = 3
    #contacts = MinistryContactFactory.create_batch(size=batch_size)
    contacts = list()

    for i in range(batch_size - 1):
        contacts.append(MinistryContactFactory())

    get_resp = test_client.get(f'/ministry-contacts', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == len(contacts) + init_records_count


def test_get_ministry_contacts_major_mines(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/ministry-contacts?is_major_mine=true', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    init_records_count = len(get_data['records'])

    batch_size = 3
    # contacts = MinistryContactFactory.create_batch(size=batch_size, major_mine=True)
    contacts = list()

    for i in range(batch_size - 1):
        contacts.append(MinistryContactFactory(major_mine=True))

    get_resp = test_client.get(
        f'/ministry-contacts?is_major_mine=true', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == len(contacts) + init_records_count


def test_get_ministry_contacts_by_mine_region_code(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/ministry-contacts/NE/contacts', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    init_records_count = len(get_data['records'])

    batch_size = 3

    # contacts = MinistryContactFactory.create_batch(size=batch_size, mine_region_code='NE')
    contacts = list()

    for i in range(batch_size - 1):
        contacts.append(MinistryContactFactory(mine_region_code='NE'))

    get_resp = test_client.get(
        f'/ministry-contacts/NE/contacts', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == len(contacts) + init_records_count


def test_post_ministry_contacts(test_client, db_session, auth_headers):
    data = {
        'emli_contact_type_code': 'SHI',
        'mine_region_code': 'SW',
        'email': 'test@email.com',
        'phone_number': '250-111-8888',
        'major_mine': True
    }
    post_resp = test_client.post(
        f'/ministry-contacts', json=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 200


def test_post_no_body(test_client, db_session, auth_headers):
    data = {}

    post_resp = test_client.post(
        f'/ministry-contacts', headers=auth_headers['full_auth_header'], json=data)
    assert post_resp.status_code == 400
