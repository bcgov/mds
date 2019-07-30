import json, pytest
from tests.factories import MineFactory, MineExpectedDocumentFactory


# GET
@pytest.mark.skip(reason='This functionality is not currently hooked up or in use.')
def test_get_mine_documents_by_mine_guid(test_client, db_session, auth_headers):
    mine_documents_count = 5
    mine = MineFactory(minimal=True)

    exp_doc = MineExpectedDocumentFactory.create_batch(size=1,
                                                       mine=mine,
                                                       related_documents=mine_documents_count)

    get_resp = test_client.get(f'/mines/{mine.mine_guid}/documents/',
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == mine_documents_count
