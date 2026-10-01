import pytest
import json, uuid, os
from unittest import mock

from app.extensions import cache, jwt as _jwt
from app.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.utils.access_decorators import VIEW_ALL, MINESPACE_PROPONENT

from tests.constants import BASE_AUTH_CLAIMS, TOKEN_HEADER
from tests.factories import DocumentFactory


def test_download_file_happy_path(test_client, db_session, auth_headers, tmp_path):
    document = DocumentFactory(path_root=tmp_path, file_display_name='testfile.pdf')
    #write file
    test_data = 'Contents of file'
    file_path = document.full_storage_path
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(test_data)

    token_guid = uuid.uuid4()
    #retieve file with token
    with mock.patch.object(cache, 'get') as mock_cache_get:
        mock_cache_get.return_value = document.document_guid

        get_resp = test_client.get(f'/documents?token={token_guid}')
        assert get_resp.status_code == 200
        assert get_resp.data.decode() == test_data
        mock_cache_get.assert_called_with(DOWNLOAD_TOKEN(token_guid))


def test_download_file_no_token(test_client, db_session):
    get_resp = test_client.get(f'/documents')
    assert get_resp.status_code == 400, get_resp.__dict__
    get_data = json.loads(get_resp.data.decode())

    assert get_data['status'] == 400
    assert get_data['message'] is not ''


def test_download_file_invalid_token(test_client, db_session):
    get_resp = test_client.get(f'/documents?token={uuid.uuid4()}')
    assert get_resp.status_code == 400, get_resp.response
    get_data = json.loads(get_resp.data.decode())

    assert get_data['status'] == 400
    assert get_data['message'] is not ''


def test_download_file_presigned_url_happy_path(test_client, db_session):
    document = DocumentFactory(file_display_name='table.png', object_store_path='bucket/path/to/object.png')
    token_guid = uuid.uuid4()

    with mock.patch.object(cache, 'get') as mock_cache_get, \
         mock.patch('app.docman.resources.document.ObjectStoreStorageService') as mock_storage_service:
        mock_cache_get.return_value = document.document_guid
        mock_storage_service.return_value.generate_download_presigned_url.return_value = 'https://example.s3/presigned-url'

        get_resp = test_client.get(f'/documents?token={token_guid}&presigned_url=true')

        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())
        assert get_data['url'] == 'https://example.s3/presigned-url'
        mock_cache_get.assert_called_with(DOWNLOAD_TOKEN(token_guid))
        mock_storage_service.return_value.generate_download_presigned_url.assert_called_once()


def test_download_file_presigned_url_requires_object_store_document(test_client, db_session, tmp_path):
    document = DocumentFactory(path_root=tmp_path, file_display_name='testfile.pdf', object_store_path=None)
    token_guid = uuid.uuid4()

    with mock.patch.object(cache, 'get') as mock_cache_get:
        mock_cache_get.return_value = document.document_guid

        get_resp = test_client.get(f'/documents?token={token_guid}&presigned_url=true')

        assert get_resp.status_code == 400
        get_data = json.loads(get_resp.data.decode())
        assert get_data['status'] == 400
        assert 'Pre-signed URL is only available for object-store-backed documents' in get_data['message']

def test_get_upload_status_no_document(test_client, auth_headers):
    """Should return 404 for a non-existing document"""

    get_resp = test_client.get(
        f'/documents/{uuid.uuid4()}/upload-status',
        headers=auth_headers['full_auth_header']
    )

    assert get_resp.status_code == 404

def test_get_upload_status_existing_document(test_client, auth_headers):
    """Should return 200 and status for an existing document"""

    # setup
    document = DocumentFactory()

    get_resp = test_client.get(
        f'/documents/{document.document_guid}/upload-status',
        headers=auth_headers['full_auth_header']
    )

    assert get_resp.status_code == 200
    get_data = json.loads(get_resp.data.decode())

    # here you can assert on the actual data returned.
    # make sure status in returned data matches status of document in setup
    assert 'status' in get_data
    assert get_data['status'] == document.status


def _auth_header_with_roles(roles):
    token = _jwt.create_jwt({**BASE_AUTH_CLAIMS, "client_roles": roles}, TOKEN_HEADER)
    return {'Authorization': 'Bearer ' + token}


@pytest.mark.parametrize("roles", [[VIEW_ALL], [MINESPACE_PROPONENT]])
def test_post_documents_zip_allowed_roles(test_client, roles):
    """Users who can view documents (Core view-all or MineSpace) can start a zip"""
    document_guids = [str(uuid.uuid4())]

    with mock.patch('app.services.commands_helper.create_zip_task') as mock_create_zip_task:
        mock_create_zip_task.return_value = {'task_id': 'test-task-id'}

        post_resp = test_client.post(
            '/documents/zip',
            json={'zip_file_name': 'test.zip', 'document_manager_guids': document_guids},
            headers=_auth_header_with_roles(roles)
        )

        assert post_resp.status_code == 200
        mock_create_zip_task.assert_called_once_with('test.zip', document_guids)


def test_post_documents_zip_forbidden_without_role(test_client, auth_headers):
    """Users without a document view role cannot start a zip"""
    with mock.patch('app.services.commands_helper.create_zip_task') as mock_create_zip_task:
        post_resp = test_client.post(
            '/documents/zip',
            json={'zip_file_name': 'test.zip', 'document_manager_guids': [str(uuid.uuid4())]},
            headers=auth_headers['base_auth_header']
        )

        assert post_resp.status_code == 403
        mock_create_zip_task.assert_not_called()
