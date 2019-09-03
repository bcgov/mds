import json, uuid
from tests.factories import MineFactory
from tests.status_code_gen import RandomRequiredDocument


# GET
def test_get_all_expected_documents_by_mine_guid(test_client, db_session, auth_headers):
    batch_size = 5
    mine = MineFactory(mine_expected_documents=batch_size)

    get_resp = test_client.get('/documents/expected/mines/' + str(mine.mine_guid),
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['expected_mine_documents']) == batch_size


def test_post_expected_documents_by_mine_guid(test_client, db_session, auth_headers):
    mine = MineFactory()

    req_guid = RandomRequiredDocument().req_document_guid
    new_expected_document = [{'req_document_guid': req_guid, 'document_name': 'a name'}]
    post_documents = {'documents': new_expected_document}
    post_resp = test_client.post('/documents/expected/mines/' + str(mine.mine_guid),
                                 json=post_documents,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert len(post_data['expected_mine_documents']) == 1
    assert post_data['expected_mine_documents'][0]['req_document_guid'] == str(req_guid)


def test_get_all_expected_documents_by_mine_guid_after_insert(test_client, db_session,
                                                              auth_headers):
    mine = MineFactory()

    get_resp = test_client.get('/documents/expected/mines/' + str(mine.mine_guid),
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    org_exp_document_list_len = len(get_data['expected_mine_documents'])

    req_guid = RandomRequiredDocument().req_document_guid
    new_expected_document = [{'req_document_guid': req_guid, 'document_name': 'a name'}]
    post_documents = {'documents': new_expected_document}
    post_resp = test_client.post('/documents/expected/mines/' + str(mine.mine_guid),
                                 json=post_documents,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200

    get_resp = test_client.get('/documents/expected/mines/' + str(mine.mine_guid),
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['expected_mine_documents']) == org_exp_document_list_len + 1
    assert all(ed['mine_guid'] == str(mine.mine_guid) for ed in get_data['expected_mine_documents'])