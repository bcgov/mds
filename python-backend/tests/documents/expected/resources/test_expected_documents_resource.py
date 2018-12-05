import json
import uuid
from tests.constants import TEST_MINE_GUID, TEST_EXPECTED_DOCUMENT_GUID1


# GET
def test_get_expected_document_by_guid(test_client, auth_headers):
    get_resp = test_client.get(
        '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['expected_document']['exp_document_guid'] == TEST_EXPECTED_DOCUMENT_GUID1


def test_put_expected_document_by_guid(test_client, auth_headers):
    get_resp = test_client.get(
        '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    org_exp_doc = get_data['expected_document']

    put_exp_doc = org_exp_doc
    put_exp_doc['exp_document_name'] = 'updatedocumentname'

    put_resp = test_client.put('/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1, json={
                               'document': put_exp_doc}, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['expected_document']['exp_document_name'] == 'updatedocumentname'
    assert put_data['expected_document']['exp_document_guid'] == TEST_EXPECTED_DOCUMENT_GUID1

    get_resp = test_client.get(
        '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['expected_document']['exp_document_name'] == put_data['expected_document']['exp_document_name']


def test_del_expected_document_by_guid(test_client, auth_headers):
    del_resp = test_client.delete(
        '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1, headers=auth_headers['full_auth_header'])
    del_data = json.loads(del_resp.data.decode())
    assert del_resp.status_code == 200

    get_resp = test_client.get(
        '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
