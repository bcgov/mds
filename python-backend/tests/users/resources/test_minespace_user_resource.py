import pytest
import json, uuid, requests
from tests.constants import TEST_MINE_GUID, TEST_TAILINGS_STORAGE_FACILITY_NAME2, TEST_TAILINGS_STORAGE_FACILITY_NAME1, DUMMY_USER_KWARGS
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.extensions import db

TEST_MINESPACE_USER_EMAIL1 = "email1@srv.com"
TEST_MINESPACE_USER_EMAIL_BAD_FORMAT = "badd email address"
TEST_MINESPACE_USER_EMAIL_TOO_LONG = "test" * 500 + "@server.com"


@pytest.fixture(scope="function")
def setup_info(test_client):
    mu = MinespaceUser.create_minespace_user(TEST_MINESPACE_USER_EMAIL1)
    mu.save()

    yield dict(
        test_minespace_user_email=TEST_MINESPACE_USER_EMAIL1, test_minespace_user_id=mu.user_id)

    db.session.delete(mu)
    db.session.commit()


def test_get_minespace_users_all(test_client, auth_headers, setup_info):
    get_resp = test_client.get('/users/minespace', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['users'][0]["email"] == setup_info["test_minespace_user_email"]


def test_get_minespace_user_by_id(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/users/minespace/' + str(setup_info['test_minespace_user_id']),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data["email"] == setup_info["test_minespace_user_email"]


def test_get_minespace_user_by_email(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/users/minespace?email=' + TEST_MINESPACE_USER_EMAIL1,
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data["email"] == setup_info["test_minespace_user_email"]


def test_post_minespace_user_duplicate_email(test_client, auth_headers, setup_info):
    data = {
        "email": TEST_MINESPACE_USER_EMAIL1,
        "mine_guids": ["7dc50e1c-18cf-4272-9d5c-eb144959e109"]
    }

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 500, post_resp.response
    assert json.loads(post_resp.data.decode())["error"]["message"]


def test_post_minespace_user_bad_email(test_client, auth_headers, setup_info):
    data = {
        "email": TEST_MINESPACE_USER_EMAIL_BAD_FORMAT,
        "mine_guids": ["7dc50e1c-18cf-4272-9d5c-eb144959e109"]
    }

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 500, post_resp.response
    assert json.loads(post_resp.data.decode())["error"]["message"]


def test_post_minespace_user_email_too_long(test_client, auth_headers, setup_info):
    data = {
        "email": TEST_MINESPACE_USER_EMAIL_TOO_LONG,
        "mine_guids": ["7dc50e1c-18cf-4272-9d5c-eb144959e109"]
    }

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 500, post_resp.response
    assert json.loads(post_resp.data.decode())["error"]["message"]


def test_post_minespace_user_new_email(test_client, auth_headers, setup_info):
    data = {"email": "new_email@server.com", "mine_guids": ["7dc50e1c-18cf-4272-9d5c-eb144959e109"]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200, post_resp.response

    new_mu = MinespaceUser.find_by_email(data["email"])
    db.session.delete(new_mu)
    db.session.commit()

    assert json.loads(post_resp.data.decode())["email"] == data["email"]
