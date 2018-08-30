from datetime import datetime
from tests.constants import TEST_PERSON_GUID, TEST_PERSON_2_GUID, TEST_MANAGER_GUID, TEST_PERSON_3_GUID, TEST_MINE_GUID


# GET Person
def test_get_person_no_auth(test_client):
    get_resp = test_client.get('/person/' + TEST_PERSON_GUID, headers={})
    assert get_resp.status_code == 401


def test_get_person_view_only(test_client, auth_headers):
    get_resp = test_client.get('/person/' + TEST_PERSON_GUID, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_person_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/person/' + TEST_PERSON_GUID, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# GET Persons
def test_get_persons_no_auth(test_client):
    get_resp = test_client.get('/persons', headers={})
    assert get_resp.status_code == 401


def test_get_persons_view_only(test_client, auth_headers):
    get_resp = test_client.get('/persons', headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_persons_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/persons', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# POST Person
def test_post_person_no_auth(test_client):
    post_resp = test_client.post('/person', headers={})
    assert post_resp.status_code == 401


def test_post_person_view_only(test_client, auth_headers):
    post_resp = test_client.post('/person', headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_person_full_auth(test_client, auth_headers):
    test_person_data = {"first_name": "FirstAuth", "surname": "LastAuth"}
    post_resp = test_client.post('/person', data=test_person_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200


# PUT Auth
def test_put_person_no_auth(test_client):
    put_resp = test_client.put('/person/' + TEST_PERSON_GUID, headers={})
    assert put_resp.status_code == 401


def test_put_person_view_only(test_client, auth_headers):
    put_resp = test_client.put('/person/' + TEST_PERSON_GUID, headers=auth_headers['view_only_auth_header'])
    assert put_resp.status_code == 401


def test_put_person_full_auth(test_client, auth_headers):
    test_person_data = {"first_name": "first_auth", "surname": "last"}
    put_resp = test_client.put('/person/' + TEST_PERSON_2_GUID, data=test_person_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200


# GET Manager Auth
def test_get_manager_no_auth(test_client):
    get_resp = test_client.get('/manager/' + TEST_MANAGER_GUID, headers={})
    assert get_resp.status_code == 401


def test_get_manager_view_only(test_client, auth_headers):
    get_resp = test_client.get('/manager/' + TEST_MANAGER_GUID, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_manager_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/manager/' + TEST_MANAGER_GUID, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# POST Manager Auth
def test_post_manager_no_auth(test_client, auth_headers):
    post_resp = test_client.post('/manager', data={}, headers={})
    assert post_resp.status_code == 401


def test_post_manager_view_only(test_client, auth_headers):
    post_resp = test_client.post('/manager', data={}, headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_manager_full_auth(test_client, auth_headers):
    test_manager_data = {"person_guid": TEST_PERSON_3_GUID, "mine_guid": TEST_MINE_GUID, "effective_date": datetime.today().strftime("%Y-%m-%d"), "expiry_date": datetime.today().strftime("%Y-%m-%d")}
    post_resp = test_client.post('/manager', data=test_manager_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200
