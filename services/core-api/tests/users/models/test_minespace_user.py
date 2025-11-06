import pytest

from app.api.users.minespace.models.minespace_user import MinespaceUser
from tests.factories import MinespaceUserFactory, MineFactory


def test_minespace_user_has_versioning_attributes(db_session):
    # Test that MinespaceUser has SQLAlchemy-Continuum versioning attributes.
    # This serves as a canary test to catch import timing issues that break versioning.
    # Circular imports with MinespaceUser can easily break versioning (generally, use lazy imports inside a function to fix)

    user = MinespaceUserFactory()

    # Assert that versioning attributes exist
    assert hasattr(user, 'versions'), "MinespaceUser should have 'versions' attribute for SQLAlchemy-Continuum versioning"
    assert hasattr(user, 'history'), "MinespaceUser should have 'history' attribute for SQLAlchemy-Continuum versioning"

    # Verify that history is accessible and returns a list
    history = user.history
    assert isinstance(history, list), "MinespaceUser.history should return a list"


def test_minespace_user_model_find_by_id(db_session):
    user = MinespaceUserFactory()

    mu = MinespaceUser.find_by_id(user.user_id)
    assert mu.bceid_username == user.bceid_username


def test_minespace_user_model_find_by_username(db_session):
    bceid_username = MinespaceUserFactory().bceid_username

    mu = MinespaceUser.find_by_username(bceid_username)
    assert mu.bceid_username == bceid_username


def test_minespace_user_model_find_all(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()

    all_mu = MinespaceUser.get_all()
    assert len(all_mu) == 2
    assert any(mu.bceid_username == user1.bceid_username for mu in all_mu)


def test_minespace_user_model_find_by_mine_guid(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()
    user3 = MinespaceUserFactory()

    mine1 = MineFactory()
    mine2 = MineFactory()

    MinespaceSubscriptionFactory(mine=mine1, minespace_user=user1)
    MinespaceSubscriptionFactory(mine=mine1, minespace_user=user2)
    MinespaceSubscriptionFactory(mine=mine2, minespace_user=user3)

    users_by_mine1 = MinespaceUser.find_by_mine_guid(mine1.mine_guid)
    assert len(users_by_mine1) == 2
    
    # all users assigned to mine1 should be returned, but not other subscriptions
    user_ids = list(x.user_id for x in users_by_mine1)    
    assert user_ids == [user1.user_id, user2.user_id]


def test_minespace_user_find_by_token_data_with_sub(db_session):
    # Test finding user by sub field when it exists
    user = MinespaceUserFactory()
    user.sub = f"{user.bceid_username}@bceid"
    user.deleted_ind = False
    user.save()

    token_data = {
        "sub": user.sub,
        "bceid_username": user.bceid_username,
        "email": "test@example.com"
    }

    found_user = MinespaceUser.find_by_token_data(**token_data)
    assert found_user is not None, "Should find user by sub field"
    assert found_user.user_id == user.user_id, "Should return the correct user"


def test_minespace_user_find_by_token_data_by_bceid_username(db_session):
    # Test finding user by bceid_username when sub doesn't exist
    user = MinespaceUserFactory()
    user.sub = None
    user.deleted_ind = False
    user.save()

    token_data = {
        "sub": f"{user.bceid_username}@bceid",
        "bceid_username": user.bceid_username,
        "email": "test@example.com"
    }

    found_user = MinespaceUser.find_by_token_data(**token_data)
    assert found_user is not None, "Should find user by bceid_username"
    assert found_user.user_id == user.user_id, "Should return the correct user"


def test_minespace_user_find_by_token_data_no_match(db_session):
    # Test when no user matches the token data
    user = MinespaceUserFactory()

    token_data = {
        "sub": "nonexistent@bceid",
        "bceid_username": "nonexistent_username",
        "email": "test@example.com"
    }

    found_user = MinespaceUser.find_by_token_data(**token_data)
    assert found_user is None, "Should return None when no user matches"


def test_minespace_user_update_from_token_data_existing_user(db_session):
    # Test updating an existing user with token data
    user = MinespaceUserFactory()
    user.sub = None
    user.deleted_ind = False
    user.given_name = "OriginalName"
    user.family_name = "OriginalFamily"
    user.email = "original@example.com"
    user.save()

    token_data = {
        "sub": f"{user.bceid_username}@bceid",
        "bceid_username": user.bceid_username,
        "given_name": "UpdatedName",
        "family_name": "UpdatedFamily",
        "email": "updated@example.com",
        "display_name": "First Last"
    }

    updated_user = MinespaceUser.update_from_token_data(**token_data)

    assert updated_user is not None
    assert updated_user.user_id == user.user_id
    assert updated_user.sub == token_data["sub"]
    assert updated_user.given_name == token_data["given_name"]
    assert updated_user.family_name == token_data["family_name"]
    assert updated_user.email == token_data["email"]
    assert updated_user.display_name == token_data["display_name"]


def test_minespace_user_update_from_token_data_no_user(db_session):
    # Test updating when no user is found
    token_data = {
        "sub": "nonexistent@bceid",
        "bceid_username": "nonexistent_username",
        "given_name": "UpdatedName"
    }

    result = MinespaceUser.update_from_token_data(**token_data)
    assert result is None, "Should return None when no user is found to update"
