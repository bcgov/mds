import pytest
from app.extensions import db
from tests.constants import TEST_PARTY_PER_FIRST_NAME_1, TEST_PARTY_PER_PARTY_NAME_1, TEST_PARTY_PER_GUID_1, TEST_MANAGER_GUID, TEST_MINE_GUID, TEST_PARTY_ORG_NAME
from app.api.users.minespace.models.minespace_user import MinespaceUser

TEST_MINESPACE_USER_EMAIL1 = "email1@srv.com"


@pytest.fixture(scope="function")
def setup_info(test_client):
    mu = MinespaceUser.create_minespace_user(TEST_MINESPACE_USER_EMAIL1)
    mu.save()

    yield dict(test_minespace_user=mu)

    db.session.delete(mu)
    db.session.commit()


def test_minespace_user_model_find_by_id(test_client, auth_headers, setup_info):
    mu = MinespaceUser.find_by_id(setup_info["test_minespace_user"].user_id)
    assert str(mu.email) == TEST_MINESPACE_USER_EMAIL1


def test_minespace_user_model_find_by_email(test_client, auth_headers, setup_info):
    mu = MinespaceUser.find_by_email(setup_info["test_minespace_user"].email)
    assert str(mu.email) == TEST_MINESPACE_USER_EMAIL1


def test_minespace_user_model_find_all(test_client, auth_headers, setup_info):
    all_mu = MinespaceUser.get_all()
    assert any(mu.email == TEST_MINESPACE_USER_EMAIL1 for mu in all_mu)
