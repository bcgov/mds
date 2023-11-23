import pytest
import json
import uuid
from datetime import datetime

from tests.factories import PermitFactory, PartyFactory, MinePartyAppointmentFactory, create_mine_and_permit


# GET
def test_get_permittee_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/parties/mines/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404, str(get_resp.response)
    assert get_data['message']


def test_get_permittee(test_client, db_session, auth_headers):
    appt_guid = MinePartyAppointmentFactory(permittee=True).mine_party_appt_guid

    get_resp = test_client.get(
        f'/parties/mines/{appt_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, str(get_resp.response)
    assert get_data['mine_party_appt_guid'] == str(appt_guid)
    assert get_data['mine_party_appt_type_code'] == 'PMT'


#POST
def test_post_permittee_no_party(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()

    data = {
        'mine_guid': str(mine.mine_guid),
        'related_guid': str(permit.permit_guid),
        'mine_party_appt_type_code': 'PMT',
        'effective_date': datetime.today().strftime("%Y-%m-%d"),
        'start_date': str(datetime.today().date()),
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 404, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['message']


def test_post_permittee_no_permit(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    party_guid = PartyFactory(company=True).party_guid
    data = {
        'mine_guid': str(mine.mine_guid),
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'PMT',
        'effective_date': datetime.today().strftime("%Y-%m-%d"),
        'start_date': str(datetime.today().date()),
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404, str(post_resp.response)
    assert post_data['message']


def test_post_permittee(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    party_guid = PartyFactory(person=True).party_guid

    data = {
        'mine_guid': str(mine.mine_guid),
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'PMT',
        'related_guid': str(permit.permit_guid),
        'effective_date': datetime.today().strftime("%Y-%m-%d"),
        'start_date': str(datetime.today().date()),
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, str(post_resp.response)
    assert post_data['party_guid'] == str(party_guid)


def test_post_permittee_permit_guid_not_found(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    party_guid = PartyFactory(person=True).party_guid

    data = {
        'mine_guid': str(mine.mine_guid),
        'party_guid': str(party_guid),
        'mine_party_appt_type_code': 'PMT',
        'related_guid': str(uuid.uuid4()),
        'effective_date': datetime.today().strftime("%Y-%m-%d"),
        'start_date': str(datetime.today().date()),
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404, str(post_resp.response)
    assert post_data['message']


def test_post_permittee_party_guid_not_found(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()

    data = {
        'mine_guid': str(mine.mine_guid),
        'party_guid': str(uuid.uuid4()),
        'mine_party_appt_type_code': 'PMT',
        'related_guid': str(permit.permit_guid),
        'effective_date': datetime.today().strftime("%Y-%m-%d"),
        'start_date': str(datetime.today().date()),
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 404, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['message']
