import json, uuid, pytest
from datetime import date, timedelta
from tests.constants import TEST_MINE_PARTY_APPT_GUID, TEST_MINE_GUID, TEST_PARTY_PER_GUID_1, TEST_MINE_PARTY_APPT_TYPE_CODE2, TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1, TEST_MINE_PARTY_APPT_TYPE_CODE1, TEST_TAILINGS_STORAGE_FACILITY_GUID1, DUMMY_USER_KWARGS
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import db

MM_APPT_LENGTH = timedelta(days=14)
INIT_START_DATE = date(2000, 1, 1)
INIT_END_DATE = INIT_START_DATE + MM_APPT_LENGTH


@pytest.fixture(scope="function")
def setup_info(test_client):
    mine_manager_1 = MinePartyAppointment(
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        mine_party_appt_type_code='MMG',
        start_date=INIT_START_DATE,
        end_date=INIT_END_DATE,
        processed_by=DUMMY_USER_KWARGS.get('update_user'),
        **DUMMY_USER_KWARGS)
    mine_manager_1.save()

    mine_manager_2 = MinePartyAppointment(
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        mine_party_appt_type_code='MMG',
        start_date=INIT_START_DATE + timedelta(days=500),
        end_date=INIT_END_DATE + timedelta(days=500),
        processed_by=DUMMY_USER_KWARGS.get('update_user'),
        **DUMMY_USER_KWARGS)
    mine_manager_2.save()

    yield dict(mine_manager_1=mine_manager_1, mine_manager_2=mine_manager_2)

    db.session.delete(mine_manager_1)
    db.session.delete(mine_manager_2)
    db.session.commit()


#POST
def test_post_mine_manager_happy_before(test_client, auth_headers, setup_info):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': "MMG",
        'start_date': str(INIT_START_DATE - MM_APPT_LENGTH - timedelta(days=1)),
        'end_date': str(INIT_END_DATE - MM_APPT_LENGTH - timedelta(days=1)),
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response

    #clean-up
    new_mpa = MinePartyAppointment.find_by_mine_party_appt_guid(post_data["mine_party_appt_guid"])
    db.session.delete(new_mpa)
    db.session.commit()


def test_post_mine_manager_happy_after(test_client, auth_headers, setup_info):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': "MMG",
        'start_date': str(INIT_START_DATE + MM_APPT_LENGTH + timedelta(days=1)),
        'end_date': str(INIT_END_DATE + MM_APPT_LENGTH + timedelta(days=1)),
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    #clean-up
    new_mpa = MinePartyAppointment.find_by_mine_party_appt_guid(post_data["mine_party_appt_guid"])
    db.session.delete(new_mpa)
    db.session.commit()


def test_post_mine_manager_overlap_one_day_start(test_client, auth_headers, setup_info):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': "MMG",
        'start_date': str(INIT_START_DATE - MM_APPT_LENGTH - timedelta(days=1)),
        'end_date': str(INIT_END_DATE - MM_APPT_LENGTH),  #same day as existing
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 500, post_resp.response


def test_post_mine_manager_overlap_one_day_end(test_client, auth_headers, setup_info):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_1,
        'mine_party_appt_type_code': "MMG",
        'start_date': str(INIT_START_DATE + MM_APPT_LENGTH),  #same day as existing
        'end_date': str(INIT_END_DATE + MM_APPT_LENGTH + timedelta(days=1)),
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 500, post_resp.response


#PUT
def test_put_mine_manager_happy_before(test_client, auth_headers, setup_info):
    test_data = {
        'start_date': str(INIT_START_DATE - MM_APPT_LENGTH - timedelta(days=1)),
        'end_date': str(INIT_END_DATE - MM_APPT_LENGTH - timedelta(days=1)),
    }
    put_resp = test_client.put(
        '/parties/mines/' + str(setup_info["mine_manager_2"].mine_party_appt_guid),
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response


def test_put_mine_manager_happy_after(test_client, auth_headers, setup_info):
    test_data = {
        'start_date': str(INIT_START_DATE + MM_APPT_LENGTH + timedelta(days=1)),
        'end_date': str(INIT_END_DATE + MM_APPT_LENGTH + timedelta(days=1)),
    }
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["mine_manager_2"].mine_party_appt_guid}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response


def test_put_mine_manager_overlap_one_day_start(test_client, auth_headers, setup_info):
    test_data = {
        'start_date': str(INIT_START_DATE - MM_APPT_LENGTH - timedelta(days=1)),
        'end_date': str(INIT_END_DATE - MM_APPT_LENGTH),
    }
    put_resp = test_client.put(
        '/parties/mines/' + str(setup_info["mine_manager_2"].mine_party_appt_guid),
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 500, put_resp.response


def test_put_mine_manager_overlap_one_day_end(test_client, auth_headers, setup_info):
    test_data = {
        'start_date': str(INIT_START_DATE + MM_APPT_LENGTH),  #same day as existing
        'end_date': str(INIT_END_DATE + MM_APPT_LENGTH + timedelta(days=1)),
    }
    put_resp = test_client.put(
        '/parties/mines/' + str(setup_info["mine_manager_2"].mine_party_appt_guid),
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 500, put_resp.response