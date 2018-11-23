import json
from tests.constants import TEST_REQUIRED_REPORT_GUID1, TEST_REQUIRED_REPORT_CATEGORY_TAILINGS


# GET
def test_get_all_required_documents(test_client, auth_headers):
    get_resp = test_client.get('/documents/required', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['required_documents']) == 3 
# GET
def test_get_required_document_by_guid(test_client, auth_headers):
    get_resp = test_client.get('/documents/required/' + TEST_REQUIRED_REPORT_GUID1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['req_document_guid'] == TEST_REQUIRED_REPORT_GUID1
# GET
def test_get_all_required_documents_by_category(test_client, auth_headers):
    get_resp = test_client.get('/documents/required?category=' + TEST_REQUIRED_REPORT_CATEGORY_TAILINGS, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['required_documents']) == 2
    assert all(rd['req_document_category'] == TEST_REQUIRED_REPORT_CATEGORY_TAILINGS for rd in get_data['required_documents'])
    