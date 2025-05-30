import json, uuid, pytest
from datetime import datetime

from tests.factories import MineFactory, PartyFactory, MinePartyAppointmentFactory, MineTailingsStorageFacilityFactory


@pytest.fixture(scope="function")
def setup_info(db_session):
    mine = MineFactory()
    mine_b = MineFactory()
    eor = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='EOR')
    mine_manager = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='MMG')
    qp = MinePartyAppointmentFactory(mine=mine, mine_party_appt_type_code='TQP')
    permittee = MinePartyAppointmentFactory(permittee=True, party__company=True)

    yield dict(
        mine_guid=str(mine.mine_guid),
        eor_party_guid=str(eor.party.party_guid),
        mine_manager_appt_guid=str(mine_manager.mine_party_appt_guid),
        mine_manager_guid=str(mine_manager.party.party_guid),
        qp_guid=str(qp.party.party_guid),
        tsf_guid=str(mine.mine_tailings_storage_facilities[0].mine_tailings_storage_facility_guid),
        unrelated_tsf_guid=str(mine_b.mine_tailings_storage_facilities[0].mine_tailings_storage_facility_guid),
        start_date=str(datetime.today().date()),
        )


# GET
def test_get_mine_party_appt_by_mine_guid(test_client, db_session, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/parties/mines?mine_guid={setup_info["mine_guid"]}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 3                    #permitee can't be found by mine guid
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
        f'/parties/mines?mine_guid={setup_info["mine_guid"]}&types=MMG&types=EOR',
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
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['mine_guid'] == setup_info['mine_guid']

def test_post_mine_party_appt_TQP_success(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'TQP',
        'related_guid': setup_info['tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['mine_guid'] == setup_info['mine_guid']
    assert post_data['mine_party_appt_guid'] is not None



def test_post_mine_party_appt_EOR_without_TSF(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['eor_party_guid'],
        'mine_party_appt_type_code': 'EOR',
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404

def test_post_mine_party_appt_TQP_without_TSF(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['qp_guid'],
        'mine_party_appt_type_code': 'TQP',
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404


def test_post_mine_party_appt_success(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'BLA',
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200


def test_post_mine_party_appt_missing_mine_guid_and_permit_guid(test_client, db_session,
                                                                auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'BLA',
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404


def test_post_mine_party_appt_missing_party_guid(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'], 
        'mine_party_appt_type_code': 'BLA',
        'start_date': setup_info['start_date'],
        }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404


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

def test_post_mine_party_appt_EOR_as_ms_user_success(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['mine_manager_guid'],
        'mine_party_appt_type_code': 'EOR',
        'related_guid': setup_info['tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['mine_guid'] == setup_info['mine_guid']
    assert post_data['status'] == 'pending'

def test_post_mine_party_appt_TQP_as_ms_user_success(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['mine_manager_guid'],
        'mine_party_appt_type_code': 'TQP',
        'related_guid': setup_info['tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['mine_guid'] == setup_info['mine_guid']
    assert post_data['mine_party_appt_guid'] is not None

def test_post_mine_party_appt_EOR_as_ms_user_other_aptt_type_fail(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['mine_manager_guid'],
        'mine_party_appt_type_code': 'BLA',
        'related_guid': setup_info['tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    assert post_resp.status_code == 403

def test_post_mine_party_appt_EOR_as_ms_user_not_associated_with_mine_fail(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'EOR',
        'related_guid': setup_info['unrelated_tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    assert post_resp.status_code == 403


def test_post_mine_party_appt_TQP_as_ms_user_not_associated_with_mine_fail(test_client, db_session, auth_headers, setup_info):
    party_guid = PartyFactory(person=True).party_guid

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'TQP',
        'related_guid': setup_info['unrelated_tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    assert post_resp.status_code == 403

def test_post_mine_party_appt_start_date_not_provided_fail(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['mine_manager_guid'],
        'mine_party_appt_type_code': 'BLA',
        'related_guid': setup_info['tsf_guid'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    assert post_resp.status_code == 400


def test_post_mine_party_appt_draft(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['mine_manager_guid'],
        'mine_party_appt_type_code': 'TQP',
        'related_guid': setup_info['tsf_guid'],
        'start_date': setup_info['start_date'],
        'is_draft': 'true'
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    post_data = json.loads(post_resp.data.decode())

    assert str(post_data['is_draft']) == 'True'

def test_put_mine_party_appt_draft(test_client, db_session, auth_headers, setup_info):
    test_data = {'start_date': '1999-12-12', 'end_date': '2001-01-01', 'is_draft': 'true'}
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["mine_manager_appt_guid"]}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())

    assert str(put_data['is_draft']) == 'True'

def test_minespace_user_can_only_add_end_date(test_client, db_session, auth_headers, setup_info, monkeypatch):
    # Mock MineReportDefinition.find_one_by_section to always return a dummy object
    class DummyDef:
        mine_report_definition_id = 123
    monkeypatch.setattr(
        'app.api.mines.reports.models.mine_report_definition.MineReportDefinition.find_one_by_section',
        staticmethod(lambda *args, **kwargs: DummyDef())
    )

    # Arrange: create a TQP appointment as a minespace user
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['mine_manager_guid'],
        'mine_party_appt_type_code': 'TQP',
        'related_guid': setup_info['tsf_guid'],
        'start_date': setup_info['start_date'],
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['proponent_only_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    appt_guid = post_data['mine_party_appt_guid']

    # Act: try to update multiple fields as a minespace user
    new_end_date = '2025-12-31'
    put_data = {
        'start_date': '1999-01-01',  # should be ignored
        'end_date': new_end_date,    # should be updated
        'mine_party_appt_type_code': 'EOR',  # should be ignored
        'party_guid': str(uuid.uuid4()),     # should be ignored
    }
    put_resp = test_client.put(
        f'/parties/mines/{appt_guid}',
        data=put_data,
        headers=auth_headers['proponent_only_auth_header'])
    assert put_resp.status_code == 200
    updated = json.loads(put_resp.data.decode())

    # Assert: only end_date is changed, other fields remain as originally created
    assert updated['end_date'] == new_end_date
    assert updated['start_date'] == setup_info['start_date']
    assert updated['mine_party_appt_type_code'] == 'TQP'
    assert updated['party_guid'] == setup_info['mine_manager_guid']