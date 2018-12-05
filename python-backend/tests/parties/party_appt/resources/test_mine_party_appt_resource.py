import json
from tests.constants import TEST_MINE_GUID, TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1


# GET
def test_get_mine_party_appt_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/parties/mines?mine_guid=' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert all(mpa['mine_guid'] == TEST_MINE_GUID for mpa in get_data)
