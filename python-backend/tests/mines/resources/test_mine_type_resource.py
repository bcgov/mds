import json
from tests.constants import (
    TEST_MINE_GUID,
    TEST_MINE_TENURE_TYPE_CODES
)

# POST
def test_post_mine_type_success(test_client, auth_headers):
    test_mine_type_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    post_resp = test_client.post('/mines/mine_types', data=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_type_guid'] != None
    assert post_data['mine_guid'] == test_mine_type_data['mine_guid']
    assert post_data['mine_tenure_type_code'] == test_mine_type_data['mine_tenure_type_code']


def test_post_mine_type_missing_mine_guid(test_client, auth_headers):
    test_mine_type_data = {
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    post_resp = test_client.post('/mines/mine_types', data=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_guid.'
        }
    }


def test_post_mine_type_missing_mine_tenure_type_code(test_client, auth_headers):
    test_mine_type_data = {
        'mine_guid': TEST_MINE_GUID
    }
    post_resp = test_client.post('/mines/mine_types', data=test_mine_type_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_tenure_type_code.'
        }
    }
