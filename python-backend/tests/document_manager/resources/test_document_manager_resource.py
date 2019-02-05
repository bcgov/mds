import json
import io
import filecmp
import os
import pytest
import shutil


def test_download_file_no_guid(test_client, auth_headers):
    get_resp = test_client.get(
        f'/document-manager', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['error']['status'] == 400
    assert get_data['error']['message'] is not ''


def test_download_file_no_doc_with_guid(test_client, auth_headers):
    get_resp = test_client.get(
        f'/document-manager/1234', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 404
    assert get_data['error']['status'] == 404
    assert get_data['error']['message'] is not ''
