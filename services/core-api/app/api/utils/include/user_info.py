from app.extensions import jwt
from jose import jwt as jwt_jose
from flask import has_request_context

VALID_REALM = ['idir']

DUMMY_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "typ": "Bearer",
    "username": "mds",
    "preferred_username": "mds",
    "email": "test-email",
    "given_name": "test-given-name",
    "client_roles": []
}


class User:
    _test_mode = False

    def get_user_raw_info(self):
        if self._test_mode:
            return DUMMY_AUTH_CLAIMS
        token = jwt.get_token_auth_header()
        return jwt_jose.get_unverified_claims(token)

    def get_user_email(self):
        raw_info = self.get_user_raw_info()
        return raw_info.get('email')

    def get_user_username(self):
        if has_request_context():

            raw_info = self.get_user_raw_info()
            realms = list(set(VALID_REALM) & set(raw_info['client_roles']))
            return realms[0] + '\\' + raw_info['preferred_username'] if realms else raw_info[
                'preferred_username']
        else:
            return 'system'
