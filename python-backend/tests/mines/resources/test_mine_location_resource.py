import json
from tests.constants import TEST_LOCATION_GUID


def test_get_location_by_location_guid(test_client, auth_headers):
    get_resp = test_client.get('/mine/location/' + TEST_LOCATION_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_location_guid'] == TEST_LOCATION_GUID
    assert get_resp.status_code == 200
