import pytest
import json, uuid, requests
from tests.constants import TEST_MINE_GUID, DUMMY_USER_KWARGS
from tests.constants import TEST_PARTY_PER_EMAIL_1, TEST_PARTY_PER_PHONE_EXT_1, TEST_PARTY_PER_PHONE_EXT_1
from app.api.users.core.models.core_user import CoreUser
from app.extensions import db


@pytest.fixture(scope="function")
def setup_info(test_client):
    cu = CoreUser.create(TEST_PARTY_PER_EMAIL_1, TEST_PARTY_PER_PHONE_EXT_1,
                         TEST_PARTY_PER_PHONE_EXT_1)
    cu.save()

    yield dict(
        test_core_user=cu,
        test_core_user_email=TEST_PARTY_PER_EMAIL_1,
        test_core_user_guid=cu.core_user_guid)

    db.session.delete(cu)
    db.session.commit()


def test_get_core_users_all(test_client, auth_headers, setup_info):
    get_resp = test_client.get('/users/core', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['results'][0]["email"] == setup_info["test_core_user_email"]


def test_get_core_user_by_guid(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/users/core/' + str(setup_info['test_core_user_guid']),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data["email"] == setup_info["test_core_user_email"]


def test_put_core_user_update_email(test_client, auth_headers, setup_info):
    data = {"email": "new_email@server.com"}

    put_resp = test_client.put(
        '/users/core/' + str(setup_info['test_core_user_guid']),
        headers=auth_headers['full_auth_header'],
        data=data)

    assert put_resp.status_code == 200, put_resp.response

    assert json.loads(put_resp.data.decode())["email"] == data["email"]