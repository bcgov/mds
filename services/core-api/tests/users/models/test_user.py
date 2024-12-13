from datetime import datetime
from pytz import utc
from app.api.users.models.user import User
from tests.factories import UserFactory


def test_user_find_by_sub(db_session):
    user = UserFactory()

    # Find the user by its `sub`
    found_user = User.find_by_sub(user.sub)

    # Assertions to ensure the user can be found correctly
    assert found_user is not None
    assert found_user.sub == user.sub
    assert found_user.email == user.email


def test_user_model_find_all(db_session):
    # Define batch size and create multiple User instances
    batch_size = 3
    users = UserFactory.create_batch(size=batch_size)

    # Get all the users from the database
    all_users = User.query.filter_by(deleted_ind=False).all()  # Assuming `SoftDeleteMixin` is in use
    assert len(all_users) == batch_size  # Ensure the batch size matches the created instances


def test_user_create_or_update_user_create_new_user(db_session):
    # Create a user via the `create_or_update_user` method
    user_data = {
        "sub": "unique-sub-id",
        "email": "test@example.com",
        "given_name": "Test",
        "family_name": "User",
        "display_name": "Test User",
        "idir_username": "testuser",
        "identity_provider": "idir",
        "idir_user_guid": "unique-idir-guid",
        "last_logged_in": datetime.now(tz=utc),
    }

    new_user = User.create_or_update_user(**user_data)

    # Validate that the user was created correctly
    assert new_user is not None
    assert new_user.sub == user_data["sub"]
    assert new_user.email == user_data["email"]


def test_user_create_or_update_user_update_existing_user(db_session):
    # Create an initial user
    user = UserFactory()

    # Update the existing user's data
    updated_data = {
        "sub": user.sub,
        "email": "updated@example.com",
        "given_name": "Updated",
        "family_name": "Name",
        "idir_username": "testuser",
        "display_name": "Updated Name",
    }

    updated_user = User.create_or_update_user(**updated_data)

    # Validate that the user's information was updated
    assert updated_user is not None
    assert updated_user.email == "updated@example.com"
    assert updated_user.given_name == "Updated"
    assert updated_user.family_name == "Name"
    assert updated_user.display_name == "Updated Name"


def test_user_soft_delete(db_session):
    # Create a user
    user = UserFactory()

    # Delete the user
    user.delete()

    # Validate that the user is marked as deleted
    assert user.deleted_ind is True

    # Ensure the user is not returned in a default query
    active_users = User.query.filter_by(deleted_ind=False).all()
    assert user not in active_users