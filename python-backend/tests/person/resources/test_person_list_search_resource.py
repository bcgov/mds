import json
from tests.constants import TEST_FIRST_NAME, TEST_FIRST_NAME_2, TEST_FIRST_NAME_3


def test_get_persons_by_list_search(test_client, auth_headers):
    get_resp = test_client.get('/parties/names?type=per?search=first_name3', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['first_name'] in [TEST_FIRST_NAME, TEST_FIRST_NAME_2, TEST_FIRST_NAME_3]
