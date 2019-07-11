import pytest
import json, uuid, os
from unittest import mock

from app.extensions import cache
from app.api.constants import DOWNLOAD_TOKEN
# TODO: fix docman tests
#from tests.factories import DocumentManagerFactory

@pytest.mark.skip(reason='docman microservice not complete')
def test_download_file_happy_path(test_client, db_session, auth_headers, tmp_path):
    document = DocumentManagerFactory(path_root=tmp_path, file_display_name='testfile.pdf')

    test_data = 'Contents of file'
    file_path = document.full_storage_path
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(test_data)

    token_resp = test_client.get(
        f'/document-manager/{document.document_guid}/token',
        headers=auth_headers['full_auth_header'])
    token_data = json.loads(token_resp.data.decode())
    token_guid = token_data['token_guid']
    assert token_resp.status_code == 200
    assert token_guid

    with mock.patch.object(cache, 'get') as mock_cache_get:
        mock_cache_get.return_value = document.document_guid

        get_resp = test_client.get(f'/document-manager?token={token_guid}')
        assert get_resp.status_code == 200
        assert get_resp.data.decode() == test_data
        mock_cache_get.assert_called_with(DOWNLOAD_TOKEN(token_guid))

@pytest.mark.skip(reason='docman microservice not complete')
def test_download_file_no_token(test_client, db_session):
    get_resp = test_client.get(f'/document-manager')
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['status'] == 400
    assert get_data['message'] is not ''

@pytest.mark.skip(reason='docman microservice not complete')
def test_download_file_invalid_token(test_client, db_session):
    get_resp = test_client.get(f'/document-manager?token={uuid.uuid4()}')
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['status'] == 400
    assert get_data['message'] is not ''
