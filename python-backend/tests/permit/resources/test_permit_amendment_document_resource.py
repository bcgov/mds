import json, pytest, uuid

from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit.models.permit import Permit

from tests.factories import PermitAmendmentFactory, PermitAmendmentDocumentFactory


# PUT
def test_put_new_file(test_client, db_session, auth_headers):
    permit_amendment = PermitAmendmentFactory()
    document_count = len(permit_amendment.documents)

    data = {'document_manager_guid': str(uuid.uuid4()), 'filename': 'a_file.pdf'}
    put_resp = test_client.put(
        f'/permits/amendments/{permit_amendment.permit_amendment_guid}/documents',
        headers=auth_headers['full_auth_header'],
        data=data)

    assert put_resp.status_code == 200
    assert len(permit_amendment.documents) == document_count + 1


def test_happy_path_file_removal(test_client, db_session, auth_headers):
    doc = PermitAmendmentDocumentFactory()
    amendment = doc.permit_amendment
    assert doc in amendment.documents


    del_resp = test_client.delete(
        f'/permits/amendments/{amendment.permit_amendment_guid}/documents/{doc.permit_amendment_document_guid}',
        headers=auth_headers['full_auth_header'])

    assert del_resp.status_code == 204
    assert doc not in amendment.documents


def test_remove_file_no_doc_guid(test_client, db_session, auth_headers):
    doc = PermitAmendmentDocumentFactory()

    del_resp = test_client.delete(
        f'/permits/amendments/{doc.permit_amendment.permit_amendment_guid}/documents',
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(del_resp.data.decode())
    assert del_resp.status_code == 400
    assert post_data['error']['message'] is not None
    assert len(doc.permit_amendment.documents) == 1


def test_remove_file_no_doc(test_client, db_session, auth_headers):
    doc = PermitAmendmentDocumentFactory()

    del_resp = test_client.delete(
        f'/permits/amendments/{doc.permit_amendment.permit_amendment_guid}/documents/{uuid.uuid4()}',
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(del_resp.data.decode())
    assert del_resp.status_code == 404
    assert post_data['error']['message'] is not None


def test_remove_file_no_exp_doc(test_client, db_session, auth_headers):
    doc = PermitAmendmentDocumentFactory()

    del_resp = test_client.delete(
        f'/permits/amendments/{uuid.uuid4()}/documents/{doc.permit_amendment_document_guid}',
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(del_resp.data.decode())
    assert del_resp.status_code == 404
    assert post_data['error']['message'] is not None
