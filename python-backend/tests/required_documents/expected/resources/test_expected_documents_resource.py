import json
import uuid
from tests.factories import MineExpectedDocumentFactory


# GET
def test_get_expected_document_by_guid(test_client, db_session, auth_headers):
    exp_doc_guid = MineExpectedDocumentFactory().exp_document_guid

    get_resp = test_client.get('/documents/expected/' + str(exp_doc_guid),
                               headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200, get_resp.response

    get_data = json.loads(get_resp.data.decode())
    assert get_data['exp_document_guid'] == str(exp_doc_guid)


def test_put_expected_document_by_guid(test_client, db_session, auth_headers):
    exp_doc_guid = MineExpectedDocumentFactory().exp_document_guid

    put_resp = test_client.put('/documents/expected/' + str(exp_doc_guid),
                               data={'exp_document_name': 'updatedocumentname'},
                               headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['exp_document_name'] == 'updatedocumentname'
    assert put_data['exp_document_guid'] == str(exp_doc_guid)


def test_del_expected_document_by_guid(test_client, db_session, auth_headers):
    exp_doc_guid = MineExpectedDocumentFactory().exp_document_guid

    del_resp = test_client.delete('/documents/expected/' + str(exp_doc_guid),
                                  headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 204

    get_resp = test_client.get('/documents/expected/' + str(exp_doc_guid),
                               headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404