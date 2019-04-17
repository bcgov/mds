import json, uuid, pytest

from tests.factories import MineFactory, PartyFactory, MinePartyAppointmentFactory


@pytest.fixture(scope="function")
def setup_info(db_session):
    mine = MineFactory()
    eor = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='EOR')
    mine_manager = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='MMG')
    permitee = MinePartyAppointmentFactory(
        mine=mine, mine_party_appt_type_code='PMT', party__company=True)

    yield dict(
        mine_guid=str(mine.mine_guid),
        eor_party_guid=str(eor.party.party_guid),
        mine_manager_appt_guid=str(mine_manager.mine_party_appt_guid),
        tsf_guid=str(
            mine.mine_tailings_storage_facilities[0].mine_tailings_storage_facility_guid))


# GET
def test_get_mine_party_appt_by_mine_guid(test_client, db_session, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/parties/mines?mine_guid={setup_info["mine_guid"]}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 3
    assert all(mpa['mine_guid'] == setup_info['mine_guid'] for mpa in get_data)


def test_get_mine_party_appt_by_party_guid(test_client, db_session, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/parties/mines?party_guid={setup_info["eor_party_guid"]}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 1
    assert get_data[0]['party_guid'] == setup_info['eor_party_guid']


def test_get_mine_party_appt_by_type(test_client, db_session, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/parties/mines?mine_guid={setup_info["mine_guid"]}&types=EOR',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 1
    assert get_data[0]['mine_guid'] == setup_info['mine_guid']


def test_get_mine_party_appt_by_multiple_types(test_client, db_session, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/parties/mines?mine_guid={setup_info["mine_guid"]}&types=MMG&types=PMT',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 2
    assert all(mpa['mine_guid'] == setup_info['mine_guid'] for mpa in get_data)


def test_post_mine_party_appt_EOR_success(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'EOR',
        'related_guid': setup_info['tsf_guid'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['mine_guid'] == setup_info['mine_guid']


def test_post_mine_party_appt_EOR_without_TSF(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['eor_party_guid'],
        'mine_party_appt_type_code': 'EOR'
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_party_appt_success(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'BLA'
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200


def test_post_mine_party_appt_missing_mine_guid(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {'party_guid': str(party_guid), 'mine_party_appt_type_code': 'BLA'}
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_party_appt_missing_party_guid(test_client, db_session, auth_headers, setup_info):
    test_data = {'mine_guid': setup_info['mine_guid'], 'mine_party_appt_type_code': 'BLA'}
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


# PUT
def test_put_mine_party_appt_success(test_client, db_session, auth_headers, setup_info):
    test_data = {'start_date': '1999-12-12', 'end_date': '2001-01-01'}
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["mine_manager_appt_guid"]}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200


def test_delete_mine_party_appt_success(test_client, db_session, auth_headers, setup_info):
    del_resp = test_client.delete(
        f'/parties/mines/{setup_info["mine_manager_appt_guid"]}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 204


def test_delete_mine_party_appt_invalid_guid(test_client, db_session, auth_headers, setup_info):
    del_resp = test_client.delete(
        f'/parties/mines/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404
