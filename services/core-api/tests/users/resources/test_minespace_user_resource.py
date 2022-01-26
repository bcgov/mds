import json, uuid

from tests.factories import MineFactory, MinespaceUserFactory


def test_get_minespace_users_all(test_client, db_session, auth_headers):
    user_email = MinespaceUserFactory().email_or_username

    get_resp = test_client.get('/users/minespace', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['records']) == 1
    assert get_data['records'][0]['email_or_username'] == user_email


def test_get_minespace_user_by_id(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    get_resp = test_client.get(
        f'/users/minespace/{user.user_id}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['email_or_username'] == user.email_or_username


def test_get_minespace_user_by_email(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    get_resp = test_client.get(
        f'/users/minespace?email={user.email_or_username}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['records'][0]['email_or_username'] == user.email_or_username


def test_post_minespace_user_duplicate_email(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    data = {'email_or_username': user.email_or_username, "mine_guids": [str(uuid.uuid4())]}
    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, post_resp.response
    assert json.loads(post_resp.data.decode())["message"], post_resp.response


def test_post_minespace_user_email_too_long(test_client, db_session, auth_headers):
    data = {'email_or_username': 'a' * 255 + "@server.com", "mine_guids": [str(uuid.uuid4())]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, post_resp.response
    assert json.loads(post_resp.data.decode())["message"], post_resp.response


def test_post_minespace_user_new_email(test_client, db_session, auth_headers):
    data = {'email_or_username': "new_email@server.com", "mine_guids": [str(uuid.uuid4())]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200, post_resp.response
    assert json.loads(post_resp.data.decode())['email_or_username'] == data['email_or_username']


def test_delete_minespace_success(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    del_resp = test_client.delete(
        f'/users/minespace/{user.user_id}', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 204, del_resp.response


def test_delete_minespace_not_found(test_client, db_session, auth_headers):
    del_resp = test_client.delete(
        '/users/minespace/11112233', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp.response


def test_update_minespace_user_mines_success(test_client, db_session, auth_headers):
    
    user = MinespaceUserFactory()
    mine = MineFactory()
    email = user.email_or_username
    mine_guids = [str(mine.mine_guid)]

    data = {
    "email_or_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/{user.user_id}', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 200, put_resp.response
    decoded_resp = json.loads(put_resp.data)
    mines = decoded_resp['records'][0]['mines']

    assert mines[0] == str(mine.mine_guid)
    assert len(mines) == 1
    

def test_update_minespace_user_empty_mine_list(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    
    email = user.email_or_username
    mine_guids = []

    data = {
    "email_or_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/{user.user_id}', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 400, put_resp.response


def test_update_minespace_user_mine_does_not_exist(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    email = user.email_or_username
    mine_guids = [str(uuid.uuid4())]

    data = {
    "email_or_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/{user.user_id}', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 404, put_resp.response

def test_update_minespace_user_does_not_exist(test_client, db_session, auth_headers):
    
    email = "test@email.com"
    mine_guids = [str(uuid.uuid4())]

    data = {
    "email_or_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/1', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 404, put_resp.response