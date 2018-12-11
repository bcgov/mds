import json
import io
import filecmp
import os
import pytest
import shutil
import uuid

from unittest import mock

from tests.constants import TEST_EXPECTED_DOCUMENT_GUID1


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

    yield dict(
        file_upload_1=(io.BytesIO(b'Test File'), 'file1.docx'),
        file_upload_2=(io.BytesIO(b'Test File'), 'file2.pdf'),
        document_manager_guid1=str(TEST_DOCUMENT_MANAGER_GUID1),
        document_manager_guid2=str(TEST_DOCUMENT_MANAGER_GUID2),
    )


def requests_post(setup_info):
    return {
        'status': 200,
        'errors': [],
        'document_manager_guids': {
            setup_info.get('document_manager_guid1'): 'file1.docx',
            setup_info.get('document_manager_guid2'): 'file2.pdf'
        }
    }


def test_happy_path_file_upload(test_client, auth_headers, setup_info):

    with mock.patch('requests.post') as mock_request:

        mock_request.return_value = MockResponse({
            'status': 200,
            'errors': [],
            'document_manager_guids': {
                setup_info.get('document_manager_guid1'): 'file1.docx',
                setup_info.get('document_manager_guid2'): 'file2.pdf'
            }
        }, 200)

        data = {
            'file':
            [setup_info.get('file_upload_1'),
             setup_info.get('file_upload_2')],
        }
        post_resp = test_client.post(
            '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1 +
            '/document',
            headers=auth_headers['full_auth_header'],
            data=data)

        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 200
        assert 'file1.docx' in post_data['files']
        assert 'file2.pdf' in post_data['files']


def test_file_upload_with_no_file(test_client, auth_headers, setup_info):

    post_resp = test_client.post(
        '/documents/expected/' + TEST_EXPECTED_DOCUMENT_GUID1 + '/document',
        headers=auth_headers['full_auth_header'],
        data={})

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 400
    assert post_data['errors']['file'] is not None
    assert post_data['message'] is not None
