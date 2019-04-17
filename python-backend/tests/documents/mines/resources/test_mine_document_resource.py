import json
from tests.factories import MineFactory


# GET
def test_get_mine_documents_by_mine_guid(test_client, db_session, auth_headers):
    mine_documents_count = 5
    mine = MineFactory(mine_expected_documents=1, mine_expected_documents__related_documents=mine_documents_count)

    get_resp = test_client.get(
        '/documents/mines/' + str(mine.mine_guid), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_documents']) == mine_documents_count
