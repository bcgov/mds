import json
from datetime import datetime
from pytz import utc

from unittest.mock import patch
from app.api.users.models.user import User
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.utils.include.user_info import User as UserUtils
from tests.factories import MinespaceUserFactory


def test_user_resource_get(test_client, auth_headers):
    # Setup test user info
    test_user_info = {
        "sub": "bce4ffa4b74741c79afa82287bfffbc8@idir",
        "email": "test-email",
        "given_name": "Test",
        "family_name": "Testerson",
        "display_name": "Testerson, Test: MCM:EX",
        "idir_username": "TTESTERSON",
        "idir_user_guid": "BCE4FFA4B63641C79AFA82287BFFFBC8",
        "last_logged_in": datetime.now(tz=utc),
    }

    # Mock UserUtils and User.create_or_update_user
    with patch.object(UserUtils, 'get_user_raw_info', return_value=test_user_info), \
            patch.object(User, 'create_or_update_user', return_value=test_user_info):
        # Make GET request
        get_resp = test_client.get('/users/profile', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200

        # Parse response
        get_data = json.loads(get_resp.data.decode())
        # Validate response matches test_user_info
        assert get_data["email"] == test_user_info["email"]
        assert get_data["sub"] == test_user_info["sub"]
        assert get_data["given_name"] == test_user_info["given_name"]
        assert get_data["family_name"] == test_user_info["family_name"]
        assert get_data["display_name"] == test_user_info["display_name"]


def test_minespace_user_profile_update(test_client, auth_headers, db_session):
    # create a realistic "legacy" minespace user with minimal attributes
    minespace_user = MinespaceUserFactory(bceid_username="test-proponent@bceid")
    minespace_user.deleted_ind = False
    minespace_user.save()

    original_given_name = minespace_user.given_name
    original_family_name = minespace_user.family_name
    original_display_name = minespace_user.display_name
    original_email = minespace_user.email
    
    updated_user_info = {
        "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc@bceidboth",
        "email": "updated-email@example.com",
        "given_name": "UpdatedFirstName",
        "family_name": "UpdatedLastName",
        "display_name": "UpdatedLastName, UpdatedFirstName",
        "bceid_username": "test-proponent",
        "bceid_user_guid": minespace_user.bceid_user_guid,
        "identity_provider": "bceid",
    }

    with patch.object(UserUtils, 'get_user_raw_info', return_value=updated_user_info):

        get_resp = test_client.get('/users/profile', headers=auth_headers['proponent_only_auth_header'])
        assert get_resp.status_code == 200

        get_data = json.loads(get_resp.data.decode())
        
        # Verify that the profile data in response matches updated info
        assert get_data["email"] == updated_user_info["email"]
        assert get_data["given_name"] == updated_user_info["given_name"]
        assert get_data["family_name"] == updated_user_info["family_name"]
        assert get_data["display_name"] == updated_user_info["display_name"]

        db_session.refresh(minespace_user)

        assert minespace_user.email == updated_user_info["email"]
        assert minespace_user.given_name == updated_user_info["given_name"]  
        assert minespace_user.family_name == updated_user_info["family_name"]
        assert minespace_user.display_name == updated_user_info["display_name"]
        assert minespace_user.sub == updated_user_info["sub"]
        assert minespace_user.bceid_username == "test-proponent@bceid"
        assert minespace_user.last_logged_in is not None

        assert minespace_user.given_name != original_given_name
        assert minespace_user.family_name != original_family_name
        assert minespace_user.display_name != original_display_name
        assert minespace_user.email != original_email