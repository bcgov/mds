import json, pytest
from tests.constants import TEST_PERMIT_GUID_1, TEST_MINE_GUID, DUMMY_USER_KWARGS
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit.models.permit import Permit
from app.extensions import db


@pytest.fixture(scope='function')
def setup_info(test_client):
    permit = Permit.find_by_permit_guid(TEST_PERMIT_GUID_1)

    test_pa = PermitAmendment.create(permit, None, None, None, DUMMY_USER_KWARGS)
    test_pa.save()

    yield {'permit_amendment_1': test_pa}

    db.session.delete(test_pa)
    try:
        #it may have been deleted by the test that executed, don't freak out.
        db.session.commit()
    except:
        pass


# GET
def test_get_permit_amendment_by_guid(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/permits/amendments/{setup_info["permit_amendment_1"].permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['permit_amendment_guid'] == str(
        setup_info['permit_amendment_1'].permit_amendment_guid)


def test_get_permit_amendment_not_found(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/permits/amendments/' + TEST_PERMIT_GUID_1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert get_data['error']['message'] is not None


def test_get_permit_amendment_by_permit(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/permits/{TEST_PERMIT_GUID_1}/amendments', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert all(pa['permit_guid'] == TEST_PERMIT_GUID_1 for pa in get_data), str(get_data)


#POST
def test_post_permit_amendment_no_params(test_client, auth_headers, setup_info):
    post_resp = test_client.post(
        f'/permits/{TEST_PERMIT_GUID_1}/amendments', headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['permit_guid'] == TEST_PERMIT_GUID_1, str(post_data)
    assert post_data['received_date'] is None
    assert post_data['issue_date'] is None
    assert post_data['authorization_end_date'] is None

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


def test_post_permit_amendment_with_date_params(test_client, auth_headers, setup_info):
    data = {
        'received_date': '2010-02-01',
        'issue_date': '2010-01-01',
        'authorization_end_date': '2012-02-01'
    }

    post_resp = test_client.post(
        f'/permits/{TEST_PERMIT_GUID_1}/amendments',
        data=data,
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['permit_guid'] == TEST_PERMIT_GUID_1, str(post_data)
    assert post_data['received_date'] == data['received_date']
    assert post_data['issue_date'] == data['issue_date']
    assert post_data['authorization_end_date'] == data['authorization_end_date']

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


def test_post_permit_amendment_with_type_params(test_client, auth_headers, setup_info):
    #new amendments are always created with Status = Active (ACT) and Type = Amendment (AMD)
    data = {'permit_amendment_type_code': 'OGP', 'permit_amendment_status_code': 'RMT'}

    post_resp = test_client.post(
        f'/permits/{TEST_PERMIT_GUID_1}/amendments',
        data=data,
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['permit_guid'] == TEST_PERMIT_GUID_1, str(post_data)
    assert post_data['permit_amendment_type_code'] == "AMD"
    assert post_data['permit_amendment_status_code'] == "ACT"

    #permit_amdendment is actually in db
    assert PermitAmendment.find_by_permit_amendment_guid(post_data['permit_amendment_guid'])


#PUT
def test_put_permit_amendment(test_client, auth_headers, setup_info):
    data = {'permit_amendment_type_code': 'OGP', 'permit_amendment_status_code': 'RMT'}
    put_resp = test_client.put(
        f'/permits/amendments/{setup_info["permit_amendment_1"].permit_amendment_guid}',
        data=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert put_data['permit_guid'] == TEST_PERMIT_GUID_1, str(put_data)
    assert put_data['permit_amendment_type_code'] == data['permit_amendment_type_code']
    assert put_data['permit_amendment_status_code'] == data['permit_amendment_status_code']
    assert put_data['received_date'] is setup_info["permit_amendment_1"].received_date
    assert put_data['issue_date'] is setup_info["permit_amendment_1"].issue_date
    assert put_data['authorization_end_date'] is setup_info[
        "permit_amendment_1"].authorization_end_date


#DELETE
def test_delete_permit_amendment(test_client, auth_headers, setup_info):
    del_resp = test_client.delete(
        f'/permits/amendments/{setup_info["permit_amendment_1"].permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 204, del_resp


def test_delete_twice_permit_amendment(test_client, auth_headers, setup_info):
    del_resp = test_client.delete(
        f'/permits/amendments/{setup_info["permit_amendment_1"].permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 204, del_resp
    #try again
    del_resp = test_client.delete(
        f'/permits/amendments/{setup_info["permit_amendment_1"].permit_amendment_guid}',
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp
    #deleted permit_amendents are not found


def test_delete_not_found_permit_amendment(test_client, auth_headers, setup_info):
    del_resp = test_client.delete(
        f'/permits/amendments/384173cf-a6e0-4fa1-bbb8-db39d90944e1',  #random guid
        headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp