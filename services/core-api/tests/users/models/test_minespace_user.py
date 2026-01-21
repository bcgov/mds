from datetime import datetime
from pytz import utc
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_request import MinespaceUserRequest
from app.api.users.minespace.models.minespace_user_role_xref import MinespaceUserRoleXref
from tests.factories import MinespaceUserFactory, MineFactory, MinespaceSubscriptionFactory


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


def test_minespace_user_create_minespace_user_new(db_session):
    bceid_username = "newuser@bceid"
    
    user = MinespaceUser.create_minespace_user(bceid_username, add_to_session=True)
    
    assert user is not None
    assert user.bceid_username == bceid_username
    assert user.deleted_ind == None


def test_minespace_user_create_minespace_user_restore_deleted(db_session):
    bceid_username = "deleteduser@bceid"
    
    # Create and then soft-delete a user
    user = MinespaceUserFactory()
    user.bceid_username = bceid_username
    user.save()
    original_user_id = user.user_id
    
    user.deleted_ind = True
    user.save()
    
    # Try to create user with same bceid_username
    restored_user = MinespaceUser.create_minespace_user(bceid_username, add_to_session=True)
    
    assert restored_user.user_id == original_user_id
    assert restored_user.deleted_ind == False
    assert restored_user.bceid_username == bceid_username


def test_minespace_user_get_all_with_requests_no_rejected(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()
    user3 = MinespaceUserFactory()
    
    # Create pending request for user1
    request1 = MinespaceUserRequest(
        user_sub="user1@bceid",
        minespace_user_id=user1.user_id,
        role_requested="PMT",
        business_name="Business 1",
        request_status=0,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request1.save()
    
    # Create approved request for user2
    request2 = MinespaceUserRequest(
        user_sub="user2@bceid",
        minespace_user_id=user2.user_id,
        role_requested="ADM",
        business_name="Business 2",
        request_status=1,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request2.save()
    
    # Create rejected request for user3
    request3 = MinespaceUserRequest(
        user_sub="user3@bceid",
        minespace_user_id=user3.user_id,
        role_requested="MMG",
        business_name="Business 3",
        request_status=2,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request3.save()
    
    # Get all with requests (excluding rejected)
    users = MinespaceUser.get_all_with_requests(include_rejected=False)
    user_ids = [u.user_id for u in users]
    
    assert user1.user_id in user_ids
    assert user2.user_id in user_ids
    assert user3.user_id not in user_ids


def test_minespace_user_get_all_with_requests_include_rejected(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()
    
    # Create rejected request for user1
    request1 = MinespaceUserRequest(
        user_sub="user1@bceid",
        minespace_user_id=user1.user_id,
        role_requested="PMT",
        business_name="Business 1",
        request_status=2,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request1.save()
    
    # Get all with requests (including rejected)
    users = MinespaceUser.get_all_with_requests(include_rejected=True)
    user_ids = [u.user_id for u in users]
    
    assert user1.user_id in user_ids
    assert user2.user_id in user_ids


def test_minespace_user_get_pending(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()
    user3 = MinespaceUserFactory()
    
    # Create pending request for user1
    request1 = MinespaceUserRequest(
        user_sub="user1@bceid",
        minespace_user_id=user1.user_id,
        role_requested="PMT",
        business_name="Business 1",
        request_status=0,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request1.save()
    
    # Create approved request for user2
    request2 = MinespaceUserRequest(
        user_sub="user2@bceid",
        minespace_user_id=user2.user_id,
        role_requested="ADM",
        business_name="Business 2",
        request_status=1,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request2.save()
    
    pending_users = MinespaceUser.get_pending()
    pending_user_ids = [u.user_id for u in pending_users]
    
    assert user1.user_id in pending_user_ids
    assert user2.user_id not in pending_user_ids
    assert user3.user_id not in pending_user_ids


def test_minespace_user_create_user_role_xrefs(db_session):
    user = MinespaceUserFactory()
    mine1 = MineFactory()
    mine2 = MineFactory()
    
    mine_guids = [str(mine1.mine_guid), str(mine2.mine_guid)]
    role_code = "PMT"
    
    user.create_user_role_xrefs(mine_guids, role_code, is_pending=True)
    
    # Check that role xrefs were created
    role_xrefs = MinespaceUserRoleXref.query.filter_by(
        minespace_user_id=user.user_id,
        deleted_ind=False
    ).all()
    
    assert len(role_xrefs) == 2
    assert all(r.minespace_user_role_code == role_code for r in role_xrefs)
    assert all(r.is_pending == True for r in role_xrefs)
    
    xref_mine_guids = [str(r.mine_guid) for r in role_xrefs]
    assert str(mine1.mine_guid) in xref_mine_guids
    assert str(mine2.mine_guid) in xref_mine_guids


def test_minespace_user_update_user_roles_add_new_roles(db_session):
    user = MinespaceUserFactory()
    mine = MineFactory()
    
    user_roles_list = [
        {
            "mine_guid": str(mine.mine_guid),
            "minespace_user_role_code": "PMT",
            "is_pending": False
        }
    ]
    
    user.update_user_roles(user_roles_list)
    
    role_xrefs = MinespaceUserRoleXref.query.filter_by(
        minespace_user_id=user.user_id,
        deleted_ind=False
    ).all()
    
    assert len(role_xrefs) == 1
    assert role_xrefs[0].minespace_user_role_code == "PMT"
    assert role_xrefs[0].is_pending == False


def test_minespace_user_update_user_roles_update_existing(db_session):
    user = MinespaceUserFactory()
    mine = MineFactory()
    
    # Create initial role xref
    role_xref = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=True
    )
    role_xref.save()
    
    xref_guid = str(role_xref.minespace_user_role_xref_guid)
    
    # Update to not pending
    user_roles_list = [
        {
            "minespace_user_role_xref_guid": xref_guid,
            "mine_guid": str(mine.mine_guid),
            "minespace_user_role_code": "PMT",
            "is_pending": False
        }
    ]
    
    user.update_user_roles(user_roles_list)
    
    # Refresh the role_xref
    db_session.refresh(role_xref)
    
    assert role_xref.is_pending == False


def test_minespace_user_update_user_roles_remove_missing(db_session):
    user = MinespaceUserFactory()
    mine1 = MineFactory()
    mine2 = MineFactory()
    
    # Create two role xrefs
    role_xref1 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine1.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=False
    )
    role_xref1.save()
    
    role_xref2 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine2.mine_guid,
        minespace_user_role_code="ADM",
        is_pending=False
    )
    role_xref2.save()
    
    # Update with only role_xref1
    user_roles_list = [
        {
            "minespace_user_role_xref_guid": str(role_xref1.minespace_user_role_xref_guid),
            "mine_guid": str(mine1.mine_guid),
            "minespace_user_role_code": "PMT",
            "is_pending": False
        }
    ]
    
    user.update_user_roles(user_roles_list)
    
    # role_xref2 should be soft-deleted
    db_session.refresh(role_xref2)
    assert role_xref2.deleted_ind == True
    
    # role_xref1 should still exist
    db_session.refresh(role_xref1)
    assert role_xref1.deleted_ind == False
