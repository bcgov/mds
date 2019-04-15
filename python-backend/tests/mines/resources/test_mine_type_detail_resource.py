import json

from tests.constants import (TEST_MINE_GUID, TEST_MINE_TYPE_GUID, TEST_MINE_TYPE_DETAIL_GUID,
                             TEST_MINE_DISTURBANCE_CODES, TEST_MINE_COMMODITY_CODES)


# POST
def test_post_mine_disturbance_success(test_client, auth_headers):
    test_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
        'mine_disturbance_code': TEST_MINE_DISTURBANCE_CODES[1]
    }
    post_resp = test_client.post(
        '/mines/mine-types/details', json=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_type_guid'] == test_data['mine_type_guid']
    assert post_data['mine_disturbance_code'] == test_data['mine_disturbance_code']
    assert post_data['mine_commodity_code'] == None


def test_post_mine_commodity_success(test_client, auth_headers):
    test_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
        'mine_commodity_code': TEST_MINE_COMMODITY_CODES[0]
    }
    post_resp = test_client.post(
        '/mines/mine-types/details', json=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_type_guid'] == test_data['mine_type_guid']
    assert post_data['mine_disturbance_code'] == None
    assert post_data['mine_commodity_code'] == test_data['mine_commodity_code']


def test_post_mine_disturbance_missing_mine_type_guid(test_client, auth_headers):
    test_mine_type_data = {'mine_disturbance_code': TEST_MINE_DISTURBANCE_CODES[1]}
    post_resp = test_client.post(
        '/mines/mine-types/details',
        json=test_mine_type_data,
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_post_mine_commodity_missing_mine_type_guid(test_client, auth_headers):
    test_mine_type_data = {'mine_commodity_code': TEST_MINE_COMMODITY_CODES[0]}
    post_resp = test_client.post(
        '/mines/mine-types/details',
        json=test_mine_type_data,
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_post_mine_type_detail_missing_mine_disturbance_code(test_client, auth_headers):
    test_mine_type_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
    }
    post_resp = test_client.post(
        '/mines/mine-types/details',
        json=test_mine_type_data,
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert 'mine_disturbance_code' in post_data['error']['message']


def test_post_mine_type_detail_missing_mine_commodity_code(test_client, auth_headers):
    test_mine_type_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
    }
    post_resp = test_client.post(
        '/mines/mine-types/details',
        json=test_mine_type_data,
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert 'mine_commodity_code' in post_data['error']['message']


def test_post_mine_type_detail_invalid_mine_disturbance_code(test_client, auth_headers):
    test_mine_type_data = {'mine_type_guid': TEST_MINE_TYPE_GUID, 'mine_disturbance_code': 'ABC'}
    post_resp = test_client.post(
        '/mines/mine-types/details',
        json=test_mine_type_data,
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 500


def test_post_mine_type_detail_invalid_mine_commdity_code(test_client, auth_headers):
    test_mine_type_data = {'mine_type_guid': TEST_MINE_TYPE_GUID, 'mine_commodity_code': 'ABC'}
    post_resp = test_client.post(
        '/mines/mine-types/details',
        json=test_mine_type_data,
        headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 500


def test_post_mine_type_detail_invalid_mine_disturbance_code_for_tenure_type(
        test_client, auth_headers):
    test_mine_type_data = {'mine_guid': TEST_MINE_GUID, 'mine_tenure_type_code': 'PLR'}
    post_mine_type_resp = test_client.post(
        '/mines/mine-types', json=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_mine_type_resp.status_code == 200

    post_data = json.loads(post_mine_type_resp.data.decode())

    test_data = {
        'mine_type_guid': post_data['mine_type_guid'],
        'mine_disturbance_code': 'CWA'  # CWA is not a valid PLR disturbance
    }
    post_resp = test_client.post(
        '/mines/mine-types/details', json=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_post_mine_type_detail_invalid_mine_commodity_code_for_tenure_type(
        test_client, auth_headers):
    # DB cleanup ===
    delete_resp = test_client.delete(
        '/mines/mine-types/' + TEST_MINE_TYPE_GUID, headers=auth_headers['full_auth_header'])
    # DB cleanup ends ===
    test_mine_type_data = {'mine_guid': TEST_MINE_GUID, 'mine_tenure_type_code': 'COL'}
    post_mine_type_resp = test_client.post(
        '/mines/mine-types', json=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_mine_type_resp.status_code == 200

    post_data = json.loads(post_mine_type_resp.data.decode())

    test_data = {
        'mine_type_guid': post_data['mine_type_guid'],
        'mine_commodity_code': 'AE'  # AE is not a valid COL commodity
    }
    post_resp = test_client.post(
        '/mines/mine-types/details', json=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


def test_post_mine_type_detail_commodity_and_disturbance(test_client, auth_headers):
    test_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
        'mine_disturbance_code': TEST_MINE_DISTURBANCE_CODES[1],
        'mine_commodity_code': TEST_MINE_COMMODITY_CODES[0]
    }
    post_resp = test_client.post(
        '/mines/mine-types/details', json=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400


# DELETE
def test_delete_mine_type_detail_success(test_client, auth_headers):
    delete_resp = test_client.delete(
        '/mines/mine-types/details/' + TEST_MINE_TYPE_DETAIL_GUID,
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204


def test_delete_mine_type_detail_missing_mine_type_detail_guid(test_client, auth_headers):
    delete_resp = test_client.delete(
        '/mines/mine-types/details/', headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 404


def test_delete_mine_type_detail_invalid_mine_type_detail_guid(test_client, auth_headers):
    delete_resp = test_client.delete(
        '/mines/mine-types/details/' + TEST_MINE_TYPE_GUID,
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 400
