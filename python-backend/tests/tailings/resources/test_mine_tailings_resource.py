import json, uuid, requests
from tests.constants import TEST_MINE_GUID, TEST_TAILINGS_STORAGE_FACILITY_NAME2, TEST_TAILINGS_STORAGE_FACILITY_NAME1, DUMMY_USER_KWARGS

from app.api.mines.mine.models.mine_identity import MineIdentity
from unittest import mock

TAILING_REQUIRED_DOCUMENTS = {
    "required_documents": [{
        "req_document_guid": "20d7ad9e-ae1d-454c-aa24-e8622caca9b9",
        "req_document_name": "Performance of high risk dumps",
        "req_document_description": "10.4.4e",
        "req_document_category": "MINE_TAILINGS",
        "req_document_due_date_type": "FIS",
        "req_document_due_date_period_months": "12"
    },
                           {
                               "req_document_guid": "7a498431-6b3c-409c-b4a7-af44933e95af",
                               "req_document_name": "Annual TSF and Dam safety recommendations",
                               "req_document_description": "10.4.4d",
                               "req_document_category": "MINE_TAILINGS",
                               "req_document_due_date_type": "FIS",
                               "req_document_due_date_period_months": "12"
                           }]
}


class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data

    def raise_for_status(self):
        return


# GET
def test_get_mine_tailings_storage_facility_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get(
        '/mines/tailings?mine_guid=' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_storage_tailings_facilities']) == 1


def test_post_mine_tailings_storage_facility_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get(
        '/mines/tailings?mine_guid=' + TEST_MINE_GUID, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    org_mine_tsf_list_len = len(get_data['mine_storage_tailings_facilities'])

    post_resp = test_client.post(
        '/mines/tailings',
        data={
            'mine_guid': TEST_MINE_GUID,
            'tsf_name': TEST_TAILINGS_STORAGE_FACILITY_NAME2
        },
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert len(post_data['mine_tailings_storage_facilities']) == (org_mine_tsf_list_len + 1)
    assert all(
        tsf['mine_guid'] == TEST_MINE_GUID for tsf in post_data['mine_tailings_storage_facilities'])


### using pytest to hit endpoints that make other web requests doesn't not play well with Wurkzerg (WSGI mock)
### secondary requests inside of resources cause jwt authentication which is dependant on the real config, not the TEST_CONFIG.
### TODO: Make new test stuite and config for integration test that authenticates against keycloak
# def test_get_mine_expected_documents_after_first_tsf(test_client, auth_headers):

#     #add a new mine to test data
#     new_mine_guid = 'b6e1c212-aa7d-4f30-8c37-f7e3837be561'
#     mine_identity2 = MineIdentity(mine_guid=uuid.UUID(new_mine_guid), **DUMMY_USER_KWARGS)
#     mine_identity2.save()

#     with mock.patch('requests.get') as documents_get_mock:
#         documents_get_mock.return_value = MockResponse(TAILING_REQUIRED_DOCUMENTS, 200)

#         post_resp = test_client.post(
#             '/mines/tailings',
#             data={
#                 'mine_guid': new_mine_guid,
#                 'tsf_name': TEST_TAILINGS_STORAGE_FACILITY_NAME1
#             },
#             headers=auth_headers['full_auth_header'])
#         post_data = json.loads(post_resp.data.decode())
#         assert post_resp.status_code == 200, str(post_resp.response)
#         assert len(post_data['mine_tailings_storage_facilities']) == 1
#         #ensure add worked correctly

#         get_resp = test_client.get(
#             '/documents/mines/expected/' + new_mine_guid, headers=auth_headers['full_auth_header'])
#         assert get_resp.status_code == 200, str(get_resp.response)
#         get_data = json.loads(get_resp.data.decode())

#         assert len(
#             get_data['mine_expected_documents']
#         ) == 2  #how many required_documents are created with category = TEST_REQUIRED_REPORT_CATEGORY_TAILINGS_GUID
#         #ensure that expected reports were actually added