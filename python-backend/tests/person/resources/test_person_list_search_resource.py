import json
from tests.constants import TEST_FIRST_NAME_3


def test_get_persons_by_list_search(test_client, auth_headers):
    get_resp = test_client.get('/persons/names?search=first_name3', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['persons'][0]['first_name'] == TEST_FIRST_NAME_3
