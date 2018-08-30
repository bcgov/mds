import json
from tests.constants import TEST_LAT_1, TEST_LONG_1, TEST_MINE_GUID


def test_get_mines(test_client, auth_headers):
    get_resp = test_client.get('/mines/location', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'mines': [{'guid': TEST_MINE_GUID, 'latitude': TEST_LAT_1, 'longitude': TEST_LONG_1}]}
    assert get_resp.status_code == 200
