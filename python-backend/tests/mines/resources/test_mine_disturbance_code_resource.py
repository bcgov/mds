import json

from tests.constants import (
    TEST_MINE_TYPE_GUID,
    TEST_MINE_DISTURBANCE_CODES,
    TEST_MINE_DISTURBANCE_DESCRIPTIONS
)


def test_get_all_mine_disturbance_types(test_client, auth_headers):
    get_resp = test_client.get('/mines/disturbance_codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    all_options = [
        {
            'mine_disturbance_code': 'SUR',
            'description': 'Surface',
            'mine_tenure_type_codes': ['COL', 'MIN', 'PLR', 'BCL'],
            'exclusive_ind': False
        },
        {
            'mine_disturbance_code': 'UND',
            'description': 'Underground',
            'mine_tenure_type_codes': ['COL', 'MIN', 'PLR'],
            'exclusive_ind': False
        },
        {
            'mine_disturbance_code': 'CWA',
            'description': 'Coal Wash',
            'mine_tenure_type_codes': ['COL'],
            'exclusive_ind': True
        },
        {
            'mine_disturbance_code': 'MIL',
            'description': 'Mill',
            'mine_tenure_type_codes': ['PLR'],
            'exclusive_ind': True
        }
    ]

    assert get_resp.status_code == 200
    assert get_data == { 'options': all_options }


# POST
def test_post_mine_disturbance_success(test_client, auth_headers):
    test_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
        'mine_disturbance_code': TEST_MINE_DISTURBANCE_CODES[0]
    }
    post_resp = test_client.post('/mines/mine_types/details', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_type_guid'] == test_data['mine_type_guid']
    assert post_data['mine_disturbance_code'] == test_data['mine_disturbance_code']


def test_post_mine_disturbance_missing_mine_type_guid(test_client, auth_headers):
    test_mine_type_data = {
        'mine_disturbance_code': TEST_MINE_DISTURBANCE_CODES[0]
    }
    post_resp = test_client.post('/mines/mine_types/details', data=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_type_guid.'
        }
    }


def test_post_mine_type_detail_missing_mine_disturbance_code(test_client, auth_headers):
    test_mine_type_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
    }
    post_resp = test_client.post('/mines/mine_types/details', data=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_disturbance_code.'
        }
    }


def test_post_mine_type_detail_invalid_mine_disturbance_code(test_client, auth_headers):
    test_mine_type_data = {
        'mine_type_guid': TEST_MINE_TYPE_GUID,
        'mine_disturbance_code': 'ABC'
    }
    post_resp = test_client.post('/mines/mine_types/details', data=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Invalid mine_disturbance_code.'
        }
    }
