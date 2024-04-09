from flask import g, has_request_context, request
from app.api.utils.access_decorators import require_auth

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
        
        if hasattr(g, 'jwt_oidc_token_info'):
            # The users token claims are set if role / auth checks have already been performed.
            # This is the case for most API requests.
            return g.jwt_oidc_token_info
        elif has_request_context() and "authorization" in request.headers:
            # In some cases (such as NoW document generation) the role / auth checks have not been performed yet,
            # so we need to manually verify the users token before we can access the claims.
            require_auth()

            return g.jwt_oidc_token_info

    def get_user_email(self):
        raw_info = self.get_user_raw_info()
        return raw_info.get('email')

    def _extract_idp_username(self, raw_info):
        if raw_info.get('bceid_username'):
            return raw_info['bceid_username'].lower() + '@bceid'
        elif raw_info.get('idir_username'):
            return raw_info['idir_username'].lower()
        else:
            return raw_info['preferred_username'].lower()

    def get_user_username(self):
        if has_request_context() and "authorization" in request.headers:

            raw_info = self.get_user_raw_info()
            realms = list(set(VALID_REALM) & set(raw_info.get('client_roles') or []))

            idp_username = self._extract_idp_username(raw_info)
            return realms[0] + '\\' + idp_username if realms else idp_username
        else:
            return 'system'
