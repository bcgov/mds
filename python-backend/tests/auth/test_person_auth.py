from datetime import datetime

from tests.constants import TEST_PARTY_PER_GUID_1, TEST_PARTY_PER_GUID_2, TEST_MANAGER_GUID, TEST_PARTY_PER_GUID_3, TEST_MINE_GUID


# GET Person
def test_get_person_no_auth(test_client):
    get_resp = test_client.get('/parties/' + TEST_PARTY_PER_GUID_1, headers={})
    assert get_resp.status_code == 401


def test_get_person_view_only(test_client, auth_headers):
    get_resp = test_client.get('/parties/' + TEST_PARTY_PER_GUID_1, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_person_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/parties/' + TEST_PARTY_PER_GUID_1, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# GET Persons
def test_get_persons_no_auth(test_client):
    get_resp = test_client.get('/parties', headers={})
    assert get_resp.status_code == 401


def test_get_persons_view_only(test_client, auth_headers):
    get_resp = test_client.get('/parties', headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_persons_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/parties', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# POST Person
def test_post_person_no_auth(test_client):
    post_resp = test_client.post('/parties', headers={})
    assert post_resp.status_code == 401


def test_post_person_view_only(test_client, auth_headers):
    post_resp = test_client.post('/parties', headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_person_full_auth(test_client, auth_headers):
    test_person_data = {"type": "PER", "first_name": "FirstAuth", "party_name": "LastAuth", "email": "testauth@test.com", "phone_no": "123-456-7899"}
    post_resp = test_client.post('/parties', data=test_person_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200


# PUT Auth
def test_put_person_no_auth(test_client):
    put_resp = test_client.put('/parties/' + TEST_PARTY_PER_GUID_1, headers={})
    assert put_resp.status_code == 401


def test_put_person_view_only(test_client, auth_headers):
    put_resp = test_client.put('/parties/' + TEST_PARTY_PER_GUID_1, headers=auth_headers['view_only_auth_header'])
    assert put_resp.status_code == 401


def test_put_person_full_auth(test_client, auth_headers):
    test_person_data = {"first_name": "first_auth", "party_name": "last2", "type": "PER"}
    put_resp = test_client.put('/parties/' + TEST_PARTY_PER_GUID_2, data=test_person_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


# GET Manager Auth
def test_get_manager_no_auth(test_client):
    get_resp = test_client.get('/managers/' + TEST_MANAGER_GUID, headers={})
    assert get_resp.status_code == 401


def test_get_manager_view_only(test_client, auth_headers):
    get_resp = test_client.get('/managers/' + TEST_MANAGER_GUID, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_manager_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/managers/' + TEST_MANAGER_GUID, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# POST Manager Auth
def test_post_manager_no_auth(test_client, auth_headers):
    post_resp = test_client.post('/managers', data={}, headers={})
    assert post_resp.status_code == 401


def test_post_manager_view_only(test_client, auth_headers):
    post_resp = test_client.post('/managers', data={}, headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_manager_full_auth(test_client, auth_headers):
    test_manager_data = {"party_guid": TEST_PARTY_PER_GUID_3, "mine_guid": TEST_MINE_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d"), "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/managers', data=test_manager_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200
