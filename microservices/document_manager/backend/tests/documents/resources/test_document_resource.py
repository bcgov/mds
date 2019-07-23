import pytest
import json, uuid, os
from unittest import mock

from app.extensions import cache
from app.constants import DOWNLOAD_TOKEN

from tests.factories import DocumentFactory


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
