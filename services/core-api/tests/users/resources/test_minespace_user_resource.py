import json, uuid

from tests.factories import MinespaceUserFactory


def test_get_minespace_users_all(test_client, db_session, auth_headers):
    user_email = MinespaceUserFactory().user_identifier

    get_resp = test_client.get('/users/minespace', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['records']) == 1
    assert get_data['records'][0]["user_identifier"] == user_email


def test_get_minespace_user_by_id(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    get_resp = test_client.get(
        f'/users/minespace/{user.user_id}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data["user_identifier"] == user.user_identifier


def test_get_minespace_user_by_email(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    get_resp = test_client.get(
        f'/users/minespace?email={user.user_identifier}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['records'][0]["user_identifier"] == user.user_identifier


def test_post_minespace_user_duplicate_email(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    data = {"user_identifier": user.user_identifier, "mine_guids": [str(uuid.uuid4())]}
    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, post_resp.response
    assert json.loads(post_resp.data.decode())["message"], post_resp.response


def test_post_minespace_user_email_too_long(test_client, db_session, auth_headers):
    data = {"user_identifier": 'a' * 255 + "@server.com", "mine_guids": [str(uuid.uuid4())]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, post_resp.response
    assert json.loads(post_resp.data.decode())["message"], post_resp.response


def test_post_minespace_user_new_email(test_client, db_session, auth_headers):
    data = {"user_identifier": "new_email@server.com", "mine_guids": [str(uuid.uuid4())]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200, post_resp.response
    assert json.loads(post_resp.data.decode())["user_identifier"] == data["user_identifier"]


def test_delete_minespace_success(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    del_resp = test_client.delete(
        f'/users/minespace/{user.user_id}', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 204, del_resp.response


def test_delete_minespace_not_found(test_client, db_session, auth_headers):
    del_resp = test_client.delete(
        '/users/minespace/11112233', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp.response
