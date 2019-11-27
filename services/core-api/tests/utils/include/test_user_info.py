from unittest import mock

from app.extensions import jwt
from app.api.utils.include.user_info import User
from tests.constants import VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER


# FIXME: This test breaks all future http requests, presumably from the patch?
# def test_get_user_info(test_client):
    # User._test_mode = False

    # auth_token = jwt.create_jwt(VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    # with mock.patch.object(jwt, 'get_token_auth_header', return_value=auth_token):
        # assert User().get_user_raw_info() == VIEW_ONLY_AUTH_CLAIMS
