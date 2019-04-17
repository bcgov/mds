import pytest
import json, uuid, requests

from app.api.users.core.models.core_user import CoreUser
from tests.factories import CoreUserFactory


def test_get_core_users_all(test_client, db_session, auth_headers):
    batch_size = 3
    users = CoreUserFactory.create_batch(size=batch_size)
    emails = map(lambda u: u.email, users)

    get_resp = test_client.get('/users/core', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['results']) == batch_size
    assert all(data['email'] in emails for data in get_data['results'])


def test_get_core_user_by_guid(test_client, db_session, auth_headers):
    user = CoreUserFactory()

    get_resp = test_client.get(
        f'/users/core/{user.core_user_guid}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data["email"] == user.email


def test_put_core_user_update_email(test_client, db_session, auth_headers):
    user = CoreUserFactory()

    data = {"email": "new_email@server.com"}
    put_resp = test_client.put(
        f'/users/core/{user.core_user_guid}', headers=auth_headers['full_auth_header'], data=data)
    assert put_resp.status_code == 200, put_resp.response
    assert json.loads(put_resp.data.decode())["email"] == data["email"]