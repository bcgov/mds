import pytest
import json
import uuid
from datetime import datetime

from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import db
from tests.constants import TEST_PARTY_PER_GUID_1, TEST_MINE_GUID, TEST_PERMIT_GUID_1, TEST_PARTY_PER_GUID_3, DUMMY_USER_KWARGS


@pytest.fixture(scope="function")
def setup_info(test_client):

    NON_EXISTENT_GUID = '8ef23184-02c4-4472-a912-380b5a0d9cae'

    permittee = MinePartyAppointment(
        mine_party_appt_guid=uuid.uuid4(),
        mine_party_appt_type_code='PMT',
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        permit_guid=uuid.UUID(TEST_PERMIT_GUID_1),
        **DUMMY_USER_KWARGS)
    permittee.save()

    yield dict(permittee_guid=str(permittee.mine_party_appt_guid), bad_guid=NON_EXISTENT_GUID)

    db.session.delete(permittee)
    db.session.commit()


# GET
def test_get_permittee_not_found(test_client, setup_info, auth_headers):
    get_resp = test_client.get(
        '/parties/mines/' + setup_info.get('bad_guid'), headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404, str(get_resp.response)
    get_data = json.loads(get_resp.data.decode())
    assert get_data['error']['message']


def test_get_permittee(test_client, setup_info, auth_headers):
    permittee_guid = setup_info.get('permittee_guid')
    get_resp = test_client.get(
        '/parties/mines/' + permittee_guid, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200, str(get_resp.response)
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_party_appt_guid'] == permittee_guid
    assert get_data['mine_party_appt_type_code'] == 'PMT'


# POST
def test_post_permittee_unexpected_id_in_url(test_client, setup_info, auth_headers):
    post_resp = test_client.post('/parties/unexpected_id', headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message']


def test_post_permittee_no_party(test_client, setup_info, auth_headers):
    data = {
        'mine_party_appt_guid': setup_info.get('permittee_guid'),
        'permit_guid': TEST_PERMIT_GUID_1,
        'mine_party_appt_type_code': 'PMT',
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 400, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message']


def test_post_permittee_no_permit(test_client, setup_info, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'mine_party_appt_type_code': 'PMT',
        'mine_party_appt_guid': setup_info.get('permittee_guid'),
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, str(post_resp.response)
    assert post_data['error']['message']


def test_post_permittee_no_permittee(test_client, setup_info, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permit_guid': TEST_PERMIT_GUID_1,
        'mine_party_appt_type_code': 'PMT',
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message']


def test_post_permittee_no_permittee_no_effective_date(test_client, setup_info, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'mine_party_appt_guid': setup_info.get('permittee_guid'),
        'mine_party_appt_type_code': 'PMT',
        'related_guid': TEST_PERMIT_GUID_1,
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message']


def test_post_permittee(test_client, setup_info, auth_headers):
    data = {
        'mine_guid': TEST_MINE_GUID,
        'party_guid': TEST_PARTY_PER_GUID_3,
        'mine_party_appt_type_code': 'PMT',
        'mine_party_appt_guid': setup_info.get('permittee_guid'),
        'related_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['party_guid'] == TEST_PARTY_PER_GUID_3


def test_post_permittee_permit_guid_not_found(test_client, setup_info, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'permit_guid': TEST_MINE_GUID,
        'mine_party_appt_guid': setup_info.get('permittee_guid'),
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message']


def test_post_permittee_party_guid_not_found(test_client, setup_info, auth_headers):
    data = {
        'party_guid': TEST_MINE_GUID,
        'mine_party_appt_guid': setup_info.get('permittee_guid'),
        'related_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    post_resp = test_client.post(
        '/parties/mines', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, str(post_resp.response)
    post_data = json.loads(post_resp.data.decode())
    assert post_data['error']['message']


def test_put_permittee_permittee_guid_not_found(test_client, setup_info, auth_headers):
    data = {
        'party_guid': TEST_PARTY_PER_GUID_3,
        'related_guid': TEST_PERMIT_GUID_1,
        'effective_date': datetime.today().strftime("%Y-%m-%d")
    }
    put_resp = test_client.put(
        '/parties/' + setup_info.get('bad_guid'),
        data=data,
        headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 404, str(put_resp.response)
    put_data = json.loads(put_resp.data.decode())
    assert put_data['error']['message']
