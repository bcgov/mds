import json
from tests.constants import TEST_PERMITTEE_GUID, TEST_MINE_GUID


# GET
def test_get_permittee_not_found(test_client, auth_headers):
    get_resp = test_client.get('/permittees/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {
        'error': {
            'status': 404,
            'message': 'Permittee not found'
        }
    }
    assert get_resp.status_code == 404


def test_get_permittee(test_client, auth_headers):
    get_resp = test_client.get('/permittees/' + TEST_PERMITTEE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['permittee_guid'] == TEST_PERMITTEE_GUID
    assert get_resp.status_code == 200
