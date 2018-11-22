import json, uuid, requests
from tests.constants import TEST_MINE_GUID, TEST_MINE_GUID2, TEST_TAILINGS_STORAGE_FACILITY_NAME2, TEST_TAILINGS_STORAGE_FACILITY_NAME1


# GET
def test_get_mine_tailings_storage_facility_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/mines/tailings?mine_guid=' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_storage_tailings_facilities']) == 1

def test_post_mine_tailings_storage_facility_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/mines/tailings?mine_guid=' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    org_mine_tsf_list_len = len(get_data['mine_storage_tailings_facilities'])

    post_resp = test_client.post('/mines/tailings', data={'mine_guid':TEST_MINE_GUID, 'tsf_name':TEST_TAILINGS_STORAGE_FACILITY_NAME2}, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert len(post_data['mine_tailings_storage_facilities']) == (org_mine_tsf_list_len +  1)
    assert all(tsf['mine_guid'] == TEST_MINE_GUID for tsf in post_data['mine_tailings_storage_facilities'])

### #appears that these tests effect each other, insert from above persists when this test runs org_exp_document_list_len is 2, only 1 inserted on setup
### using pytest to hit endpoints that make other web requests doesn't not play well with Wurkzerg (WSGI mock)
# def test_get_mine_expected_documents_after_first_tsf(test_client, auth_headers):
#     get_resp = requests.get('http://localhost:5000/mines/tailings?mine_guid=' + TEST_MINE_GUID2, headers=auth_headers['full_auth_header'])
#     raise BaseException(str(auth_headers['full_auth_header']) + ';;;;' +  str(get_resp))
#     get_data = json.loads(get_resp.data.decode())
#     assert get_resp.status_code == 200
#     org_mine_tsf_list_len = len(get_data['mine_storage_tailings_facilities'])
#     assert org_mine_tsf_list_len == 0
#     # ensure no TSF's

#     post_resp = test_client.post('/mines/tailings', data={'mine_guid':TEST_MINE_GUID2, 'tsf_name':TEST_TAILINGS_STORAGE_FACILITY_NAME1}, headers=auth_headers['full_auth_header'])
#     post_data = json.loads(post_resp.data.decode())
#     assert post_resp.status_code == 200
#     assert len(post_data['mine_tailings_storage_facilities']) == 1
#     #ensure add worked correctly

#     get_resp = test_client.get('/documents/mines/expected/' + TEST_MINE_GUID2, headers=auth_headers['full_auth_header'])
#     get_data = json.loads(get_resp.data.decode())
#     assert get_resp.status_code == 200
#     assert len(get_data['mine_expected_documents']) == 2 #how many required_documents are created with category = TEST_REQUIRED_REPORT_CATEGORY_TAILINGS_GUID
#     #ensure that expected reports were actually added