import json
import io
import filecmp
import os
import pytest
import requests

from datetime import datetime
from dateutil.relativedelta import relativedelta
from unittest import mock

from app.extensions import cache
from app.api.constants import NRIS_TOKEN


def test_get_complaince_articles(test_client, auth_headers, db_session):

    get_resp = test_client.get(f'/compliance/codes', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200, get_resp.response
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == 0
