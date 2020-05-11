import pytest

from app.api.users.minespace.models.minespace_user import MinespaceUser
from tests.factories import MinespaceUserFactory


def test_minespace_user_model_find_by_id(db_session):
    user = MinespaceUserFactory()

    mu = MinespaceUser.find_by_id(user.user_id)
    assert mu.user_identifier == user.user_identifier


def test_minespace_user_model_find_by_email(db_session):
    user_identifier = MinespaceUserFactory().user_identifier

    mu = MinespaceUser.find_by_email(user_identifier)
    assert mu.user_identifier == user_identifier


def test_minespace_user_model_find_all(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()

    all_mu = MinespaceUser.get_all()
    assert len(all_mu) == 2
    assert any(mu.user_identifier == user1.user_identifier for mu in all_mu)
