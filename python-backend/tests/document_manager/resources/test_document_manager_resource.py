import json, uuid

from app.extensions import cache
from tests.factories import DocumentManagerFactory


def test_download_file_no_token(test_client, db_session):
    get_resp = test_client.get(
        f'/document-manager')
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['error']['status'] == 400
    assert get_data['error']['message'] is not ''

def test_download_file_invalid_token(test_client, db_session):
    get_resp = test_client.get(
        f'/document-manager?token={uuid.uuid4()}')
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['error']['status'] == 400
    assert get_data['error']['message'] is not ''


def test_get_file_with_guid(test_client, db_session):
    get_resp = test_client.get(
        f'/document-manager/1234')
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 500
    assert get_data['error']['status'] == 500
    assert get_data['error']['message'] is not ''
