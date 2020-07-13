import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

from tests.factories import MineFactory, PermitFactory, PermitAmendmentFactory, PartyFactory, create_mine_and_permit


# GET
def test_get_permit_not_found(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    get_resp = test_client.get(
        f'/mines/{permit.mine.mine_guid}/permits/{uuid.uuid4()}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert 'not found' in get_data['message']
    assert get_resp.status_code == 404


def test_get_permit(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()

    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['permit_guid'] == str(permit.permit_guid)
    assert get_resp.status_code == 200


#Create
def test_post_permit(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    party_guid = PartyFactory(company=True).party_guid

    no_of_permits = len(mine.mine_permit)

    PERMIT_NO = 'mx-test-999'
    data = {
        'permittee_party_guid': str(party_guid),
        'permit_no': PERMIT_NO,
        'permit_status_code': 'O',
        'received_date': '1999-12-12',
        'issue_date': '1999-12-21',
        'authorization_end_date': '2012-12-02'
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/permits', headers=auth_headers['full_auth_header'], json=data)
    post_data = json.loads(post_resp.data.decode())

    updated_mine = Mine.find_by_mine_guid(str(mine.mine_guid))
    permittees = MinePartyAppointment.find_by_permit_id(updated_mine.mine_permit[0].permit_id)

    assert post_resp.status_code == 200
    assert updated_mine.mine_permit[0].permit_no == PERMIT_NO
    assert permittees[0].party_guid == party_guid
    assert len(updated_mine.mine_permit) == no_of_permits + 1


def test_post_permit_bad_mine_guid(test_client, db_session, auth_headers):
    post_resp = test_client.post(
        f'/mines/{uuid.uuid4()}/permits', headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 404


def test_post_permit_with_duplicate_permit_no(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    mine_guid = mine.mine_guid
    permit_no = permit.permit_no
    party_guid = PartyFactory(company=True).party_guid

    data = {'permittee_party_guid': str(party_guid), 'permit_no': permit_no}
    post_resp = test_client.post(
        f'/mines/{mine_guid}/permits', headers=auth_headers['full_auth_header'], json=data)
    assert post_resp.status_code == 400


#Put
def test_put_permit(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_guid = permit.permit_guid

    data = {'permit_status_code': 'C'}
    put_resp = test_client.put(
        f'/mines/{permit.mine.mine_guid}/permits/{permit_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data.get('permit_status_code') == 'C'


def test_put_permit_bad_permit_guid(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()

    data = {'permit_status_code': 'C'}
    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/permits/{uuid.uuid4()}',
        headers=auth_headers['full_auth_header'],
        json=data)
    assert put_resp.status_code == 404


# DELETE
def test_delete_permit(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit(permit_kwargs={"permit_status_code": 'O', "bonds": 0})
    permit_guid = permit.permit_guid

    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/permits/{permit_guid}', headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204


def test_delete_permit_fail(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit(permit_kwargs={"bonds": 1})
    permit_guid = permit.permit_guid

    delete_resp = test_client.delete(
        f'/mines/{permit.mine_guid}/permits/{permit_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 400