import json

from app.api.constants import MINE_STATUS_OPTIONS
from tests.constants import TEST_MINE_GUID


# GET
def test_get_mine_status_option(test_client, auth_headers):
    get_resp = test_client.get('/mines/status', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'options': MINE_STATUS_OPTIONS}
    assert get_resp.status_code == 200


def test_get_mine_status_not_found(test_client, auth_headers):
    get_resp = test_client.get('/mines/status/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['error']['message'] == 'Mine Status not found'
    assert get_resp.status_code == 404
