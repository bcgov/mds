import json
import io
import filecmp
import os
import pytest
import shutil
import uuid

from unittest import mock
from datetime import datetime

from tests.constants import TEST_EXPECTED_DOCUMENT_GUID1, TEST_REQUIRED_REPORT_GUID1, TEST_EXPECTED_DOCUMENT_NAME1, TEST_MINE_GUID, TEST_EXPECTED_DOCUMENT_STATUS_GUID1, DUMMY_USER_KWARGS
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument
from app.extensions import db


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data


@pytest.fixture(scope="function")
def setup_info(test_client):

    TEST_DOCUMENT_MANAGER_GUID1 = uuid.uuid4()
    TEST_DOCUMENT_MANAGER_GUID2 = uuid.uuid4()
    TEST_EXPECTED_DOCUMENT_GUID = uuid.uuid4()

    mine_document = MineDocument(
        mine_guid=TEST_MINE_GUID,
        document_manager_guid=TEST_DOCUMENT_MANAGER_GUID1,
        document_name='file.txt',
        **DUMMY_USER_KWARGS)

    mine_document.save()

    expected_document = MineExpectedDocument(
        exp_document_guid=TEST_EXPECTED_DOCUMENT_GUID,
        req_document_guid=uuid.UUID(TEST_REQUIRED_REPORT_GUID1),
        mine_guid=TEST_MINE_GUID,
        exp_document_name=TEST_EXPECTED_DOCUMENT_NAME1,
        due_date=datetime.strptime('1984-06-18', '%Y-%m-%d'),
        received_date=datetime.strptime('1984-06-18', '%Y-%m-%d'),
        exp_document_status_guid=TEST_EXPECTED_DOCUMENT_STATUS_GUID1,
        **DUMMY_USER_KWARGS)

    expected_document.mine_documents.append(mine_document)
    expected_document.save()

    yield dict(
        file_upload_1=(io.BytesIO(b'Test File'), 'file1.docx'),
        file_upload_2=(io.BytesIO(b'Test File'), 'file2.pdf'),
        document_manager_guid1=str(TEST_DOCUMENT_MANAGER_GUID1),
        document_manager_guid2=str(TEST_DOCUMENT_MANAGER_GUID2),
        mine_document=mine_document,
        expected_document=expected_document,
    )

    db.session.delete(mine_document)
    db.session.commit()
    db.session.delete(expected_document)
    db.session.commit()


def test_file_upload_with_no_file_or_guid(test_client, auth_headers, setup_info):
    post_resp = test_client.post(
        f'/documents/expected/{str(uuid.uuid4())}/document',
        headers=auth_headers['full_auth_header'],
        data={})

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert post_data['error']['message'] is not None


def test_put_existing_file(test_client, auth_headers, setup_info):
    expected_doc = setup_info.get('expected_document')
    existing_mine_doc = setup_info.get('mine_document')
    document_count= len(expected_doc.mine_documents)

    data = {'mine_document_guid': existing_mine_doc.mine_document_guid}
    post_resp = test_client.put(
        f'/documents/expected/{str(expected_doc.exp_document_guid)}/document',
        headers=auth_headers['full_auth_header'],
        data=data)

    assert post_resp.status_code == 200
    assert len(expected_doc.mine_documents) == document_count + 1


def test_put_new_file(test_client, auth_headers, setup_info):
    expected_doc = setup_info.get('expected_document')
    document_count= len(expected_doc.mine_documents)
    
    data = {'document_manager_guid': str(uuid.uuid4()), 'filename':'a_file.pdf'}
    post_resp = test_client.put(
        f'/documents/expected/{str(expected_doc.exp_document_guid)}/document',
        headers=auth_headers['full_auth_header'],
        data=data)

    assert post_resp.status_code == 200
    assert len(expected_doc.mine_documents) == document_count + 1


def test_happy_path_file_removal(test_client, auth_headers, setup_info):
    mine_document = setup_info.get('mine_document')
    expected_document = setup_info.get('expected_document')

    post_resp = test_client.delete(
        f'/documents/expected/{str(expected_document.exp_document_guid)}/document/{str(mine_document.mine_document_guid)}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 200
    assert post_data['message'] is not None
    assert mine_document not in expected_document.mine_documents


def test_remove_file_no_doc_guid(test_client, auth_headers, setup_info):
    expected_document = setup_info.get('expected_document')

    post_resp = test_client.delete(
        f'/documents/expected/{str(expected_document.exp_document_guid)}/document',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 400
    assert post_data['error']['message'] is not None


def test_remove_file_no_doc(test_client, auth_headers, setup_info):
    expected_document = setup_info.get('expected_document')

    post_resp = test_client.delete(
        f'/documents/expected/{str(expected_document.exp_document_guid)}/document/{str(uuid.uuid4())}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert post_data['error']['message'] is not None


def test_remove_file_no_exp_doc(test_client, auth_headers, setup_info):
    mine_document = setup_info.get('mine_document')

    post_resp = test_client.delete(
        f'/documents/expected/{str(uuid.uuid4())}/document/{str(mine_document.mine_document_guid)}',
        headers=auth_headers['full_auth_header'])

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 404
    assert post_data['error']['message'] is not None
