import json
from datetime import datetime
from pytz import utc

from unittest.mock import patch
from app.api.users.models.user import User
from app.api.utils.include.user_info import User as UserUtils


def test_user_resource_get(test_client, auth_headers):
    # Setup test user info
    test_user_info = {
        "sub": "bce4ffa4b74741c79afa82287bfffbc8@idir",
        "email": "test-email",
        "given_name": "Test",
        "family_name": "Testerson",
        "display_name": "Testerson, Test: EMLI:EX",
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
