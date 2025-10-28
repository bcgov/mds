import json, uuid
from app import auth
from tests.factories import MineFactory, MinespaceUserFactory, MinespaceSubscriptionFactory

def subscribe_minespace_user(db_session, mine, email='test-proponent@bceid'):
    """Create a MineSpace user and subscribe them to the mine of the given project summary."""
    ms_user = MinespaceUserFactory(email_or_username=email)  # type: ignore[arg-type]
    MinespaceSubscriptionFactory(mine=mine, minespace_user=ms_user)  # type: ignore[arg-type]
    db_session.commit()
    auth.clear_cache()
    return ms_user

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
    mines = decoded_resp['records']['mines']

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

def test_get_minespace_users_by_mine_guid(test_client, db_session, auth_headers):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()

    mine = MineFactory(minimal=True)

    # the user that performs the action
    test_user = subscribe_minespace_user(db_session, mine)

    MinespaceSubscriptionFactory(mine=mine, minespace_user=user1)
    MinespaceSubscriptionFactory(mine=mine, minespace_user=user2)

    # test that proponent can access, verify data correct
    get_resp_proponent = test_client.get(
        f'/users/minespace?mine_guid={mine.mine_guid}',
        headers=auth_headers['proponent_only_auth_header'])
    get_data = json.loads(get_resp_proponent.data.decode())
    assert get_resp_proponent.status_code == 200, get_resp_proponent.response

    user_names = sorted([x['email_or_username'] for x in get_data['records']])
    expected_names = sorted([user1.email_or_username, user2.email_or_username, test_user.email_or_username])
    assert user_names == expected_names

    # test that view only can access
    get_resp_view = test_client.get(
        f'/users/minespace?mine_guid={mine.mine_guid}',
        headers=auth_headers['view_only_auth_header'])
    assert get_resp_view.status_code == 200, get_resp_view.response

def test_get_minespace_users_no_mine_guid_bad_request(test_client, db_session, auth_headers):
    # minespace user cannot access GET resource without specifying mine_guid
    get_resp_proponent = test_client.get(
        f'/users/minespace',
        headers=auth_headers['proponent_only_auth_header'])
    assert get_resp_proponent.status_code == 400, get_resp_proponent.response
    get_data = json.loads(get_resp_proponent.data.decode())
    assert get_data['message'] == "400 Bad Request: mine_guid is a required argument"
    