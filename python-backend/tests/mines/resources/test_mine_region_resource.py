import json
from tests.constants import TEST_REGION_GUID


def test_get_region_by_region_guid(test_client, auth_headers):
    get_resp = test_client.get('/mines/region/' + TEST_REGION_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_region_guid'] == TEST_REGION_GUID
    assert get_resp.status_code == 200
