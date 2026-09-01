from unittest import mock

import pytest
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
    app.config['GEOMARK_UPLOAD_TIMEOUT'] = 300
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

GEOMARK_INFO_RESPONSE = {
    'id': 'gm-test',
    'geometryType': 'Polygon',
    'numPolygons': 1,
    'numParts': 1,
    'createDate': '2011-04-11',
    'minX': -144.664931,
    'minY': 47.527035,
    'maxX': -112.989186,
    'maxY': 60.724742,
    'centroidX': -128.104468,
    'centroidY': 54.745332,
    'numVertices': 13,
    'length': 5958503.516035516,
    'area': 1878642016189,
    'isValid': True,
    'validationError': None,
    'isSimple': True,
    'isRobust': True,
    'minimumClearance': 94994.294,
}


def test_fetch_geomark_metadata_returns_the_info_json(requests_mock, app):
    requests_mock.get(
        'https://test.apps.gov.bc.ca/pub/geomarks/gm-test.json',
        json=GEOMARK_INFO_RESPONSE,
        status_code=200)

    with app.app_context():
        metadata = GeomarkHelper().fetch_geomark_metadata('gm-test')

    assert metadata == GEOMARK_INFO_RESPONSE


def test_fetch_geomark_metadata_survives_geomark_being_unavailable(requests_mock, app):
    requests_mock.get(
        'https://test.apps.gov.bc.ca/pub/geomarks/gm-test.json', status_code=500)

    with app.app_context():
        metadata = GeomarkHelper().fetch_geomark_metadata('gm-test')

    assert metadata is None


def test_send_spatial_file_uses_configured_timeout(tmp_path, app):
    spatial_file = tmp_path / 'boundary.kml'
    spatial_file.write_text('<kml />')
    response = mock.Mock(status_code=200, text='{"id": "gm-test"}')
    response.json.return_value = {'id': 'gm-test'}

    with app.app_context(), \
            mock.patch('app.docman.utils.geomark_helper.requests.post',
                       return_value=response) as mock_post, \
            mock.patch.object(GeomarkHelper, 'add_geomark_to_group'):
        result = GeomarkHelper().send_spatial_file_to_geomark(str(spatial_file))

    assert result == {'id': 'gm-test'}
    assert mock_post.call_args.kwargs['timeout'] == 300


def test_send_spatial_file_handles_non_success_response(tmp_path, app):
    spatial_file = tmp_path / 'boundary.kml'
    spatial_file.write_text('<kml />')
    response = mock.Mock(status_code=504, text='Gateway Timeout')

    with app.app_context(), mock.patch(
            'app.docman.utils.geomark_helper.requests.post', return_value=response):
        result = GeomarkHelper().send_spatial_file_to_geomark(str(spatial_file))

    assert result == {'error': 'Geomark service returned status code: 504'}


def test_send_spatial_file_handles_invalid_json_response(tmp_path, app):
    spatial_file = tmp_path / 'boundary.kml'
    spatial_file.write_text('<kml />')
    response = mock.Mock(status_code=200, text='<html>Unavailable</html>')
    response.json.side_effect = ValueError('invalid json')

    with app.app_context(), mock.patch(
            'app.docman.utils.geomark_helper.requests.post', return_value=response):
        result = GeomarkHelper().send_spatial_file_to_geomark(str(spatial_file))

    assert result == {'error': 'Geomark service returned an invalid response'}


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
