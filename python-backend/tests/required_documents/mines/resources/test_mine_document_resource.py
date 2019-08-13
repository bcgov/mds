import json, pytest
from tests.factories import MineFactory, MineExpectedDocumentFactory


# GET
def test_get_mine_documents_by_mine_guid(test_client, db_session, auth_headers):
    mine_documents_count = 5
    mine = MineFactory(minimal=True, mine_expected_documents=mine_documents_count)
    MineExpectedDocumentFactory.create_batch(size=mine_documents_count,
                                             mine=mine)

    get_resp = test_client.get(f'/mines/{mine.mine_guid}/documents',
                               headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200

    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == mine_documents_count
