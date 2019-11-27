import pytest
import json, uuid, os
from unittest import mock

from app.extensions import cache
from app.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES

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
