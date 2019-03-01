import json, pytest, uuid
from tests.constants import TEST_PERMIT_GUID_1, TEST_MINE_GUID, DUMMY_USER_KWARGS

from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit.models.permit import Permit
from app.extensions import db

TEST_DOCUMENT_MANAGER_GUID_1 = uuid.uuid4()
TEST_DOCUMENT_MANAGER_GUID_2 = uuid.uuid4()


@pytest.fixture(scope='function')
def setup_info(test_client):
    permit = Permit.find_by_permit_guid(TEST_PERMIT_GUID_1)

    test_pa = PermitAmendment.create(permit, None, None, None, DUMMY_USER_KWARGS)
    test_pa.save()

    test_pa_doc = PermitAmendmentDocument(
        document_name="test1.pdf",
        mine_guid=TEST_MINE_GUID,
        permit_amendment_id=test_pa.permit_amendment_id,
        document_manager_guid=TEST_DOCUMENT_MANAGER_GUID_1,
        **DUMMY_USER_KWARGS)
    test_pa_doc.save()

    test_orphan_doc = PermitAmendmentDocument(
        document_name="orphan.pdf",
        mine_guid=TEST_MINE_GUID,
        permit_amendment_id=None,
        document_manager_guid=TEST_DOCUMENT_MANAGER_GUID_2,
        **DUMMY_USER_KWARGS)
    test_orphan_doc.save()

    yield {
        'permit_amendment_1': test_pa,
        'permit_amendment_document_1': test_pa_doc,
        'test_orphan_document_1': test_orphan_doc
    }

    db.session.delete(test_pa)
    db.session.delete(test_pa_doc)
    db.session.delete(test_orphan_doc)
    try:
        #it may have been deleted by the test that executed, don't freak out.
        db.session.commit()
    except:
        pass


# PUT
def test_put_new_file(test_client, auth_headers, setup_info):
    permit_amendment = setup_info.get('permit_amendment_1')
    document_count = len(permit_amendment.documents)

    data = {'document_manager_guid': str(uuid.uuid4()), 'filename': 'a_file.pdf'}
    put_resp = test_client.put(
        f'/permits/amendments/{str(permit_amendment.permit_amendment_guid)}/documents',
        headers=auth_headers['full_auth_header'],
        data=data)

    assert put_resp.status_code == 200
    assert len(permit_amendment.documents) == document_count + 1


def test_happy_path_file_removal(test_client, auth_headers, setup_info):
    permit_amendment = setup_info.get('permit_amendment_1')
    permit_amendment_document = setup_info.get('permit_amendment_document_1')

    del_resp = test_client.delete(
        f'/permits/amendments/{str(permit_amendment.permit_amendment_guid)}/documents/{str(permit_amendment_document.permit_amendment_document_guid)}',
        headers=auth_headers['full_auth_header'])

    assert del_resp.status_code == 204
    assert permit_amendment_document not in permit_amendment.documents


def test_remove_file_no_doc_guid(test_client, auth_headers, setup_info):
    permit_amendment = setup_info.get('permit_amendment_1')

    del_resp = test_client.delete(
        f'/permits/amendments/{str(permit_amendment.permit_amendment_guid)}/documents',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(del_resp.data.decode())

    assert del_resp.status_code == 400
    assert post_data['error']['message'] is not None


def test_remove_file_no_doc(test_client, auth_headers, setup_info):
    permit_amendment = setup_info.get('permit_amendment_1')

    del_resp = test_client.delete(
        f'/permits/amendments/{str(permit_amendment.permit_amendment_guid)}/documents/{str(uuid.uuid4())}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(del_resp.data.decode())

    assert del_resp.status_code == 404
    assert post_data['error']['message'] is not None


def test_remove_file_no_exp_doc(test_client, auth_headers, setup_info):
    permit_amendment_document = setup_info.get('permit_amendment_document_1')

    del_resp = test_client.delete(
        f'/permits/amendments/{str(uuid.uuid4())}/documents/{str(permit_amendment_document.permit_amendment_document_guid)}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(del_resp.data.decode())

    assert del_resp.status_code == 404
    assert post_data['error']['message'] is not None
