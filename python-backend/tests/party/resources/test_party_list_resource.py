import json
from tests.constants import TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_ORG_GUID, TEST_PARTY_PER_FIRST_NAME_2, TEST_PARTY_PER_FIRST_NAME_3, TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_GUID_2, TEST_PARTY_PER_GUID_3


# GET
def test_get_persons(test_client, auth_headers):
    get_resp = test_client.get('/parties', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['party_guid'] in [TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_GUID_2, TEST_PARTY_PER_GUID_3, TEST_PARTY_ORG_GUID]


def test_get_persons_by_list_search(test_client, auth_headers):
    get_resp = test_client.get('/parties?type=per&search=first_name3', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['first_name'] in [TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_FIRST_NAME_2, TEST_PARTY_PER_FIRST_NAME_3]
