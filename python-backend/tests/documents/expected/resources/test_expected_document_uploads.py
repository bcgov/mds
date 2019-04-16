import json
import pytest
import uuid
from datetime import datetime

from app.api.documents.mines.models.mine_document import MineDocument
from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument

from tests.factories import DocumentManagerFactory, MineExpectedDocumentFactory, MineDocumentFactory


def test_file_upload_with_no_file_or_guid(test_client, db_session, auth_headers):
    post_resp = test_client.post(
        f'/documents/expected/{str(uuid.uuid4())}/document',
        headers=auth_headers['full_auth_header'],
        json={})

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert post_data['error']['message'] is not None


def test_put_existing_file(test_client, db_session, auth_headers):
    expected_doc = MineExpectedDocumentFactory()
    existing_mine_doc = MineDocumentFactory(mine=expected_doc.mine)
    document_count = len(expected_doc.mine_documents)

    data = {'mine_document_guid': existing_mine_doc.mine_document_guid}
    post_resp = test_client.put(
        f'/documents/expected/{str(expected_doc.exp_document_guid)}/document',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert post_resp.status_code == 200
    assert len(expected_doc.related_documents) == document_count + 1


def test_put_new_file(test_client, db_session, auth_headers):
    expected_doc = MineExpectedDocumentFactory()
    new_doc = DocumentManagerFactory()
    document_count = len(expected_doc.mine_documents)

    data = {
        'document_manager_guid': str(new_doc.document_guid),
        'filename': new_doc.file_display_name
    }
    post_resp = test_client.put(
        f'/documents/expected/{str(expected_doc.exp_document_guid)}/document',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert post_resp.status_code == 200
    assert len(expected_doc.related_documents) == document_count + 1


def test_happy_path_file_removal(test_client, db_session, auth_headers):
    expected_document = MineExpectedDocumentFactory()
    mine_document = expected_document.mine_documents[0]
    assert mine_document is not None

    post_resp = test_client.delete(
        f'/documents/expected/{str(expected_document.exp_document_guid)}/document/{str(mine_document.mine_document_guid)}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 200
    assert post_data['message'] is not None
    assert mine_document not in expected_document.related_documents


def test_remove_file_no_doc_guid(test_client, db_session, auth_headers):
    expected_document = MineExpectedDocumentFactory()

    post_resp = test_client.delete(
        f'/documents/expected/{str(expected_document.exp_document_guid)}/document',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 400
    assert post_data['error']['message'] is not None


def test_remove_file_no_doc(test_client, db_session, auth_headers):
    expected_document = MineExpectedDocumentFactory()

    post_resp = test_client.delete(
        f'/documents/expected/{str(expected_document.exp_document_guid)}/document/{str(uuid.uuid4())}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert post_data['error']['message'] is not None


def test_remove_file_no_exp_doc(test_client, db_session, auth_headers):
    mine_document = MineDocumentFactory()

    post_resp = test_client.delete(
        f'/documents/expected/{str(uuid.uuid4())}/document/{str(mine_document.mine_document_guid)}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert post_data['error']['message'] is not None
