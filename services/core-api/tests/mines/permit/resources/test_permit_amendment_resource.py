import json, pytest, uuid
from datetime import datetime, timedelta
from dateutil import parser
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit.models.permit import Permit
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

from tests.factories import PermitFactory, PermitAmendmentFactory, PartyFactory, MinePartyAppointmentFactory


# GET
def test_get_permit_amendment_by_guid(test_client, db_session, auth_headers):
    permit_amendment = PermitAmendmentFactory()

    get_resp = test_client.get(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['permit_amendment_guid'] == str(permit_amendment.permit_amendment_guid)


def test_get_permit_amendment_not_found(test_client, db_session, auth_headers):
    permit_amendment = PermitAmendmentFactory()
    get_resp = test_client.get(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/' +
        str(uuid.uuid4()),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert get_data['message'] is not None


# #POST
@pytest.mark.xfail(
    reason='Failing due to null derefrence, line 133 in permit_amendment => "issue_date.date()"')
def test_post_permit_amendment_no_params(test_client, db_session, auth_headers):
    permit = PermitFactory()
    permit_guid = permit.permit_guid

    post_resp = test_client.post(
        f'/mines/{permit.mine_guid}/permits/{permit_guid}/amendments',
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    #assert post_data['permit_guid'] == str(permit_guid), str(post_data)
    assert post_data['received_date'] is None
    assert post_data['issue_date'] is None
    assert post_data['authorization_end_date'] is None

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


def test_post_permit_amendment_with_date_params(test_client, db_session, auth_headers):
    permit = PermitFactory()
    permit_guid = permit.permit_guid
    #TODO Figure out how to make permit factory make it's own initial permittee
    permittee = MinePartyAppointmentFactory(
        permit_guid=permit_guid, mine_party_appt_type_code='PMT', mine=permit.mine)
    party_guid = PartyFactory(company=True).party_guid
    data = {
        'permittee_party_guid': party_guid,
        'received_date': datetime.today().date().isoformat(),
        'issue_date': datetime.today().date().isoformat(),
        'authorization_end_date': (datetime.today() + timedelta(days=1)).date().isoformat(),
    }

    post_resp = test_client.post(
        f'/mines/{permit.mine_guid}/permits/{permit_guid}/amendments',
        json=data,
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 200, post_resp.response
    #assert post_data['permit_guid'] == str(permit_guid), str(post_data)
    assert parser.parse(post_data['received_date']) == parser.parse(data['received_date'])
    assert parser.parse(post_data['issue_date']) == parser.parse(data['issue_date'])
    assert parser.parse(post_data['authorization_end_date']) == parser.parse(
        data['authorization_end_date'])
    assert permit.permittee_appointments[0].party_guid == party_guid

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


@pytest.mark.xfail(
    reason='Failing due to null derefrence, line 133 in permit_amendment => "issue_date.date()"')
def test_post_permit_amendment_with_type_params(test_client, db_session, auth_headers):
    permit_guid = PermitFactory().permit_guid

    data = {'permit_amendment_type_code': 'OGP'}

    post_resp = test_client.post(
        f'/permits/{permit_guid}/amendments', json=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    #assert post_data['permit_guid'] == str(permit_guid), str(post_data)
    assert post_data['permit_amendment_type_code'] == "OGP"
    assert post_data['permit_amendment_status_code'] == "ACT"

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


# #PUT
def test_put_permit_amendment(test_client, db_session, auth_headers):
    permit = PermitFactory(permit_amendments=1)
    amendment = permit.permit_amendments[0]

    data = {'permit_amendment_type_code': 'AMD', 'permit_amendment_status_code': 'RMT'}
    put_resp = test_client.put(
        f'/mines/{permit.mine_guid}/permits/{permit.permit_guid}/amendments/{amendment.permit_amendment_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    #assert put_data['permit_guid'] == str(permit.permit_guid), str(put_data)
    assert put_data['permit_amendment_type_code'] == data['permit_amendment_type_code']
    assert put_data['permit_amendment_status_code'] == data['permit_amendment_status_code']
    assert parser.parse(put_data['received_date']).date() == amendment.received_date
    assert parser.parse(put_data['issue_date']).date() == amendment.issue_date
    assert parser.parse(
        put_data['authorization_end_date']).date() == amendment.authorization_end_date


#DELETE
def test_delete_permit_amendment(test_client, db_session, auth_headers):
    permit_amendment = PermitAmendmentFactory()

    del_resp = test_client.delete(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 200, del_resp
    assert PermitAmendment.find_by_permit_amendment_guid(
        str(permit_amendment.permit_amendment_guid)) is None


def test_delete_twice_permit_amendment(test_client, db_session, auth_headers):
    permit_amendment = PermitAmendmentFactory()

    del_resp = test_client.delete(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 200, del_resp

    #try again
    del_resp = test_client.delete(
        f'/mines/{permit_amendment.mine_guid}/permits/{permit_amendment.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp


def test_delete_not_found_permit_amendment(test_client, db_session, auth_headers):
    del_resp = test_client.delete(
        f'/permits/amendments/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp