import json
from tests.constants import TEST_FIRST_NAME, TEST_FIRST_NAME_2, TEST_FIRST_NAME_3, TEST_PERSON_GUID, TEST_PERSON_2_GUID, TEST_PERSON_3_GUID


# GET
def test_get_persons(test_client, auth_headers):
    get_resp = test_client.get('/parties', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['party_guid'] in [TEST_PERSON_GUID, TEST_PERSON_2_GUID, TEST_PERSON_3_GUID]


def test_get_persons_by_list_search(test_client, auth_headers):
    get_resp = test_client.get('/parties?type=per&search=first_name3', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['first_name'] in [TEST_FIRST_NAME, TEST_FIRST_NAME_2, TEST_FIRST_NAME_3]
