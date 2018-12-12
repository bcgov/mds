import json
from tests.constants import (
    TEST_MINE_GUID,
    TEST_MINE_TYPE_GUID,
    TEST_MINE_TENURE_TYPE_CODES
)

# POST
def test_post_mine_type_success(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[3]
    }
    post_resp = test_client.post('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    assert post_data['mine_type_guid'] != None
    assert post_data['mine_guid'] == test_data['mine_guid']
    assert post_data['mine_tenure_type_code'] == test_data['mine_tenure_type_code']


def test_post_mine_type_missing_mine_guid(test_client, auth_headers):
    test_data = {
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    post_resp = test_client.post('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_guid.'
        }
    }


def test_post_mine_type_missing_mine_tenure_type_code(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID
    }
    post_resp = test_client.post('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_tenure_type_code.'
        }
    }


def test_post_mine_type_invalid_mine_tenure_type_code(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': 'ABC'
    }
    post_resp = test_client.post('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400

    post_data = json.loads(post_resp.data.decode())
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unable to create mine_type.'
        }
    }


# PUT
def test_put_mine_type_success(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    put_resp = test_client.put('/mines/mine_types/' + TEST_MINE_TYPE_GUID, data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200

    put_data = json.loads(put_resp.data.decode())
    assert put_data['mine_type_guid'] != None
    assert put_data['mine_guid'] == test_data['mine_guid']
    assert put_data['mine_tenure_type_code'] == test_data['mine_tenure_type_code']


def test_put_mine_type_missing_mine_guid(test_client, auth_headers):
    test_data = {
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    put_resp = test_client.put('/mines/mine_types/' + TEST_MINE_TYPE_GUID, data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400

    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_guid.'
        }
    }


def test_put_mine_type_missing_mine_type_guid(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    put_resp = test_client.put('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400

    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_type_guid.'
        }
    }


def test_put_mine_type_missing_mine_tenure_type_code(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID
    }
    put_resp = test_client.put('/mines/mine_types/' + TEST_MINE_TYPE_GUID, data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400

    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Missing mine_tenure_type_code.'
        }
    }


def test_put_mine_type_invalid_mine_tenure_type_code(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': 'ABC'
    }
    put_resp = test_client.put('/mines/mine_types/' + TEST_MINE_TYPE_GUID, data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 400

    put_data = json.loads(put_resp.data.decode())
    assert put_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unable to update mine_type.'
        }
    }


def test_put_mine_type_identical_record(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[0]
    }
    put_resp1 = test_client.put('/mines/mine_types/' + TEST_MINE_TYPE_GUID, data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp1.status_code == 200

    put_data1 = json.loads(put_resp1.data.decode())
    assert put_data1['mine_type_guid'] != None
    assert put_data1['mine_guid'] == test_data['mine_guid']
    assert put_data1['mine_tenure_type_code'] == test_data['mine_tenure_type_code']

    put_resp2 = test_client.put('/mines/mine_types/' + TEST_MINE_TYPE_GUID, data=test_data, headers=auth_headers['full_auth_header'])
    assert put_resp2.status_code == 200

    put_data2 = json.loads(put_resp2.data.decode())
    # Do not create a new record when tenure type code is unchanged
    assert put_data2['mine_type_guid'] == put_data1['mine_type_guid']


def test_post_mine_type_duplicate(test_client, auth_headers):
    test_data = {
        'mine_guid': TEST_MINE_GUID,
        'mine_tenure_type_code': TEST_MINE_TENURE_TYPE_CODES[1]
    }
    post_resp1 = test_client.post('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp1.status_code == 200

    post_data1 = json.loads(post_resp1.data.decode())
    assert post_data1['mine_type_guid'] != None
    assert post_data1['mine_guid'] == test_data['mine_guid']

    post_resp2 = test_client.post('/mines/mine_types', data=test_data, headers=auth_headers['full_auth_header'])
    assert post_resp2.status_code == 400

    post_data2 = json.loads(post_resp2.data.decode())
    assert post_data2 == {
        'error': {
            'status': 400,
            'message': 'Error: Unable to create mine_type.'
        }
    }


# DELETE
def test_delete_mine_type_success(test_client, auth_headers):
    delete_resp = test_client.delete(
        '/mines/mine_types/' + TEST_MINE_TYPE_GUID,
        headers=auth_headers['full_auth_header']
    )
    assert delete_resp.status_code == 200

    delete_data = json.loads(delete_resp.data.decode())
    assert delete_data['mine_type_guid'] == TEST_MINE_TYPE_GUID
    assert delete_data['active_ind'] == False


def test_delete_mine_type_missing_mine_type_guid(test_client, auth_headers):
    delete_resp = test_client.delete(
        '/mines/mine_types/',
        headers=auth_headers['full_auth_header']
    )
    assert delete_resp.status_code == 404


def test_delete_mine_type_invalid_mine_type_guid(test_client, auth_headers):
    delete_resp = test_client.delete(
        '/mines/mine_types/' + TEST_MINE_GUID,
        headers=auth_headers['full_auth_header']
    )
    assert delete_resp.status_code == 400

    delete_data = json.loads(delete_resp.data.decode())
    assert delete_data == {
        'error': {
            'status': 400,
            'message': 'Error: Invalid mine_type_guid.'
        }
    }
