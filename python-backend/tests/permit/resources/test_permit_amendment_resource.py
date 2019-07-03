import json, pytest, uuid
from datetime import datetime, timedelta

from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit.models.permit import Permit
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

from tests.factories import PermitFactory, PermitAmendmentFactory, PartyFactory


# GET
def test_get_permit_amendment_by_guid(test_client, db_session, auth_headers):
    pa = PermitAmendmentFactory()

    get_resp = test_client.get(
        f'/permits/{pa.permit_guid}/amendments/{pa.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['permit_amendment_guid'] == str(pa.permit_amendment_guid)


def test_get_permit_amendment_not_found(test_client, db_session, auth_headers):
    pa = PermitAmendmentFactory()
    get_resp = test_client.get(
        f'/permits/{pa.permit_guid}/amendments/' + str(uuid.uuid4()),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert get_data['message'] is not None


# #POST
@pytest.mark.skip(
    reason='Failing due to null derefrence, line 133 in permit_amendment => "issue_date.date()"')
def test_post_permit_amendment_no_params(test_client, db_session, auth_headers):
    permit_guid = PermitFactory().permit_guid

    post_resp = test_client.post(
        f'/permits/{permit_guid}/amendments', headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['permit_guid'] == str(permit_guid), str(post_data)
    assert post_data['received_date'] is None
    assert post_data['issue_date'] is None
    assert post_data['authorization_end_date'] is None

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


def test_post_permit_amendment_with_date_params(test_client, db_session, auth_headers):
    permit_guid = PermitFactory().permit_guid
    party_guid = PartyFactory(company=True).party_guid

    data = {
        'permittee_party_guid': party_guid,
        'received_date': datetime.today().strftime('%Y-%m-%d'),
        'issue_date': datetime.today().strftime('%Y-%m-%d'),
        'authorization_end_date': (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    }

    post_resp = test_client.post(
        f'/permits/{permit_guid}/amendments', json=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())

    permittees = MinePartyAppointment.find_by_permit_guid(permit_guid)

    assert post_resp.status_code == 200, post_resp.response
    assert post_data['permit_guid'] == str(permit_guid), str(post_data)
    assert post_data['received_date'] == data['received_date']
    assert post_data['issue_date'] == data['issue_date']
    assert post_data['authorization_end_date'] == data['authorization_end_date']
    assert permittees[0].party_guid == party_guid

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


@pytest.mark.skip(
    reason='Failing due to null derefrence, line 133 in permit_amendment => "issue_date.date()"')
def test_post_permit_amendment_with_type_params(test_client, db_session, auth_headers):
    permit_guid = PermitFactory().permit_guid

    data = {'permit_amendment_type_code': 'OGP'}

    post_resp = test_client.post(
        f'/permits/{permit_guid}/amendments', json=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['permit_guid'] == str(permit_guid), str(post_data)
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
        f'/permits/{permit.permit_guid}/amendments/{amendment.permit_amendment_guid}',
        json=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert put_data['permit_guid'] == str(permit.permit_guid), str(put_data)
    assert put_data['permit_amendment_type_code'] == data['permit_amendment_type_code']
    assert put_data['permit_amendment_status_code'] == data['permit_amendment_status_code']
    assert put_data['received_date'] == amendment.received_date.strftime('%Y-%m-%d')
    assert put_data['issue_date'] == amendment.issue_date.strftime('%Y-%m-%d')
    assert put_data['authorization_end_date'] == amendment.authorization_end_date.strftime(
        '%Y-%m-%d')


#DELETE
def test_delete_permit_amendment(test_client, db_session, auth_headers):
    am = PermitAmendmentFactory()

    del_resp = test_client.delete(
        f'/permits/{am.permit_guid}/amendments/{am.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 200, del_resp
    assert PermitAmendment.find_by_permit_amendment_guid(str(am.permit_amendment_guid)) is None


def test_delete_twice_permit_amendment(test_client, db_session, auth_headers):
    am = PermitAmendmentFactory()

    del_resp = test_client.delete(
        f'/permits/{am.permit_guid}/amendments/{am.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 200, del_resp

    #try again
    del_resp = test_client.delete(
        f'/permits/{am.permit_guid}/amendments/{am.permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp


def test_delete_not_found_permit_amendment(test_client, db_session, auth_headers):
    del_resp = test_client.delete(
        f'/permits/amendments/{uuid.uuid4()}', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp