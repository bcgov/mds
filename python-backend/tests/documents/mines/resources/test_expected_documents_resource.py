import json, uuid
from tests.constants import TEST_MINE_GUID, TEST_REQUIRED_REPORT_GUID2, TEST_REQUIRED_REPORT_NAME2


# GET
def test_get_all_expected_documents_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/documents/mines/expected/' + TEST_MINE_GUID , headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_expected_documents']) == 1

def test_post_expected_documents_by_mine_guid(test_client, auth_headers):
    new_expected_document = [{
        'req_document_guid':TEST_REQUIRED_REPORT_GUID2,
        'document_name':TEST_REQUIRED_REPORT_NAME2
    }]
    post_documents = {'documents':new_expected_document}
    post_resp = test_client.post('/documents/mines/expected/' + TEST_MINE_GUID , json=post_documents, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert len(post_data['mine_expected_documents']) == 1
    assert post_data['mine_expected_documents'][0]['req_document_guid'] == TEST_REQUIRED_REPORT_GUID2

#appears that these tests effect each other, insert from above persists when this test runs org_exp_document_list_len is 2, only 1 inserted on setup
def test_get_all_expected_documents_by_mine_guid_after_insert(test_client, auth_headers):
    get_resp = test_client.get('/documents/mines/expected/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    org_exp_document_list_len = len(get_data['mine_expected_documents'])
   
    new_expected_document = [{
        'req_document_guid':TEST_REQUIRED_REPORT_GUID2,
        'document_name':TEST_REQUIRED_REPORT_NAME2
    }]
    post_documents = {'documents':new_expected_document}
    post_resp = test_client.post('/documents/mines/expected/' + TEST_MINE_GUID , json=post_documents, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    
    get_resp = test_client.get('/documents/mines/expected/' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_expected_documents']) == (org_exp_document_list_len + 1)
    assert all(ed['mine_guid'] == TEST_MINE_GUID for ed in get_data['mine_expected_documents'])
