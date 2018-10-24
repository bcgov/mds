import json
from tests.constants import TEST_PERMIT_GUID_1, TEST_MINE_GUID


# GET
def test_get_permit_not_found(test_client, auth_headers):
    get_resp = test_client.get('/permits/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Permit not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_permit(test_client, auth_headers):
    get_resp = test_client.get('/permits/' + TEST_PERMIT_GUID_1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['permit_guid'] == TEST_PERMIT_GUID_1
    assert get_resp.status_code == 200


def test_get_mine_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/mines/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert TEST_PERMIT_GUID_1 in list(map(lambda x: x['permit_guid'], get_data['mine_permit']))
    assert get_resp.status_code == 200
