import pytest

from app.api.users.minespace.models.minespace_user import MinespaceUser
from tests.factories import MinespaceUserFactory


def test_minespace_user_model_find_by_id(db_session):
    user = MinespaceUserFactory()

    mu = MinespaceUser.find_by_id(user.user_id)
    assert mu.email_or_username == user.email_or_username


def test_minespace_user_model_find_by_email(db_session):
    email_or_username = MinespaceUserFactory().email_or_username

    mu = MinespaceUser.find_by_email(email_or_username)
    assert mu.email_or_username == email_or_username


def test_minespace_user_model_find_all(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()

    all_mu = MinespaceUser.get_all()
    assert len(all_mu) == 2
    assert any(mu.email_or_username == user1.email_or_username for mu in all_mu)
