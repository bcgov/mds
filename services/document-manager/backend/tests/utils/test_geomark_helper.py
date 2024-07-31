from unittest import mock

import pytest
import requests
import requests_mock
from app.docman.utils.geomark_helper import GeomarkHelper
from flask import Flask
from werkzeug.exceptions import InternalServerError


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['GEOMARK_GROUP'] = '456'
    app.config['GEOMARK_URL_BASE'] = 'https://test.apps.gov.bc.ca/pub'
    app.config['GEOMARK_SECRET_KEY'] = 'secret_key'
    app.config['GEOMARK_PERSIST'] = True
    return app

@mock.patch('time.time', mock.MagicMock(return_value=13))
def test_add_geomark_to_group(requests_mock, app):
    geomark_id = '123'
    group_id = '456'
    timestamp = '13000'
    encoded_signature = 'FNp7eo9wgImNrbvvHzEi6gYw7mw%3D'
    url = f'https://test.apps.gov.bc.ca/pub/geomarkGroups/456/geomarks/add?geomarkId=123&signature={encoded_signature}&time=13000'
    response_json = {'status': 'Added'}

    # Mock the requests.post method
    requests_mock.post(url, json=response_json, status_code=200)

    with app.app_context():
        geomark_helper = GeomarkHelper()

        result = geomark_helper.add_geomark_to_group(geomark_id, group_id)

        assert result == response_json
        assert requests_mock.called

@mock.patch('time.time', mock.MagicMock(return_value=1))
def test_add_geomark_to_group_wrong_status(requests_mock, app):
    geomark_id = '123'
    group_id = '456'
    timestamp = '13000'
    encoded_signature = '%2BGJkxnp983m2p%2BSWgmO33TQSBNU%3D'
    url = f'https://test.apps.gov.bc.ca/pub/geomarkGroups/456/geomarks/add?geomarkId=123&signature={encoded_signature}&time=1000'
    response_json = {'status': 'Error'}

    # Mock the requests.post method
    requests_mock.post(url, json=response_json, status_code=200)

    with app.app_context():
        geomark_helper = GeomarkHelper()

        with pytest.raises(InternalServerError) as e:
            geomark_helper.add_geomark_to_group(geomark_id, group_id)

        assert str(e.value) == '500 Internal Server Error: Error adding geomark to group. Geomark service returned status: Error'
        assert requests_mock.called
