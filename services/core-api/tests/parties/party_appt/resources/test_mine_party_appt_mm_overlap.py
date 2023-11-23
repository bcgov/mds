import json, uuid, pytest
from datetime import datetime, timedelta

from tests.factories import MineFactory, MinePartyAppointmentFactory

APPT_LENGTH = timedelta(days=14)


@pytest.fixture(scope="function")
def setup_info(db_session):
    mine = MineFactory()
    existing_mine_manager = MinePartyAppointmentFactory(
        mine=mine,
        mine_party_appt_type_code='MMG',
        start_date=datetime.today(),
        end_date=datetime.today() + APPT_LENGTH)
    moving_mine_manager = MinePartyAppointmentFactory(
        mine=mine,
        mine_party_appt_type_code='MMG',
        start_date=datetime.today() + timedelta(days=500),
        end_date=datetime.today() + timedelta(days=500))

    yield dict(
        mine_guid=str(mine.mine_guid),
        party_guid=str(existing_mine_manager.party.party_guid),
        existing_mine_manager=existing_mine_manager,
        moving_mine_manager=moving_mine_manager)


#POST
def test_post_mine_manager_happy_before(test_client, db_session, auth_headers, setup_info):
    one_day_before = (setup_info['existing_mine_manager'].start_date - timedelta(days=1)).date()

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['party_guid'],
        'mine_party_appt_type_code': "MMG",
        'start_date': str(one_day_before),
        'end_date': str(one_day_before),
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response


def test_post_mine_manager_happy_after(test_client, db_session, auth_headers, setup_info):
    one_day_after = (setup_info['existing_mine_manager'].end_date + timedelta(days=1)).date()

    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['party_guid'],
        'mine_party_appt_type_code': "MMG",
        'start_date': str(one_day_after),
        'end_date': str(one_day_after + APPT_LENGTH),
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response


def test_post_mine_manager_overlap_one_day_start(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['party_guid'],
        'mine_party_appt_type_code': "MMG",
        'start_date': None,
        'end_date': str(setup_info['existing_mine_manager'].start_date.date()),
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, post_resp.response


def test_post_mine_manager_overlap_one_day_end(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'mine_guid': setup_info['mine_guid'],
        'party_guid': setup_info['party_guid'],
        'mine_party_appt_type_code': "MMG",
        'start_date': str(setup_info['existing_mine_manager'].end_date.date()),
        'end_date': None,
    }
    post_resp = test_client.post(
        '/parties/mines', data=test_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, post_resp.response


#PUT
def test_put_mine_manager_happy_before(test_client, db_session, auth_headers, setup_info):
    one_day_before = (setup_info['existing_mine_manager'].start_date - timedelta(days=1)).date()

    test_data = {
        'start_date': str(one_day_before - APPT_LENGTH),
        'end_date': str(one_day_before),
    }
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["moving_mine_manager"].mine_party_appt_guid}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response


def test_put_mine_manager_happy_after(test_client, db_session, auth_headers, setup_info):
    one_day_after = (setup_info['existing_mine_manager'].end_date + timedelta(days=1)).date()

    test_data = {
        'start_date': str(one_day_after),
        'end_date': str(one_day_after + APPT_LENGTH),
    }
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["moving_mine_manager"].mine_party_appt_guid}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response


def test_put_mine_manager_overlap_one_day_start(test_client, db_session, auth_headers, setup_info):
    existing_start = setup_info['existing_mine_manager'].start_date.date()

    test_data = {
        'start_date': str(existing_start - APPT_LENGTH),
        'end_date': str(existing_start),
    }
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["moving_mine_manager"].mine_party_appt_guid}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 400, put_resp.response


def test_put_mine_manager_overlap_one_day_end(test_client, db_session, auth_headers, setup_info):
    test_data = {
        'start_date': str(setup_info['existing_mine_manager'].end_date.date()),
        'end_date': None,
    }
    put_resp = test_client.put(
        f'/parties/mines/{setup_info["moving_mine_manager"].mine_party_appt_guid}',
        data=test_data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 400, put_resp.response
