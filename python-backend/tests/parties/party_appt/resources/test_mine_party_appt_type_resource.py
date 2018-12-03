import json
from tests.constants import TEST_MINE_GUID, TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1


# GET
def test_get_mine_party_appt_type(test_client, auth_headers):
    get_resp = test_client.get('/parties/mines/types', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data) == 2
