import json
from tests.constants import TEST_PARTY_ORG_NAME, TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_ORG_GUID, TEST_PARTY_PER_FIRST_NAME_2, TEST_PARTY_PER_FIRST_NAME_3, TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_GUID_2, TEST_PARTY_PER_GUID_3


# GET
def test_get_persons(test_client, auth_headers):
    get_resp = test_client.get('/parties', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['party_guid'] in [TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_GUID_2, TEST_PARTY_PER_GUID_3, TEST_PARTY_ORG_GUID]


def test_search_person_by_explicit(test_client, auth_headers):
    get_resp = test_client.get('/parties?search=first_name3&type=per', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['first_name'] in [TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_FIRST_NAME_2, TEST_PARTY_PER_FIRST_NAME_3]


def test_search_persons_by_implicit(test_client, auth_headers):
    get_resp = test_client.get('/parties?search=first_name3', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['first_name'] in [TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_FIRST_NAME_2, TEST_PARTY_PER_FIRST_NAME_3]


def test_search_org_by_implicit(test_client, auth_headers):
    get_resp = test_client.get('/parties?search=test_company', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['party_name'] == TEST_PARTY_ORG_NAME


def test_search_org_by_explicit(test_client, auth_headers):
    get_resp = test_client.get('/parties?search=test_company&type=org', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['parties'][0]['party_name'] == TEST_PARTY_ORG_NAME
