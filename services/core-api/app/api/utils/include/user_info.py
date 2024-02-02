from flask import g, has_request_context, request

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
            return g.jwt_oidc_token_info
        else:
            raise Exception('No user info found. Make sure to authenticate the user first.')

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
