import json
from tests.constants import TEST_MINE_GUID, TEST_REQUIRED_REPORT_CATEGORY_TAILINGS


# GET
def test_get_mine_documents_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get(
        '/documents/mines/' + TEST_MINE_GUID,
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_documents']) > 0


# GET