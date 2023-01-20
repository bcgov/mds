# Copyright © 2021 thor wolpert
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# Format error response and append status code.
"""JWTManager handles validating JWTs using a minimal configuration for an OIDC server.

The JWKS store is cached and refreshed on a periodic basis.
"""

import json
import ssl  # pylint: disable=unused-import # noqa: F401; for local hacks
from functools import wraps

from cachelib import SimpleCache
from flask import _request_ctx_stack, current_app, g, jsonify, request
from jose import jwt
from six.moves.urllib.request import urlopen

from .exceptions import AuthError


class JwtManager:  # pylint: disable=too-many-instance-attributes
    """Manages the JWT verification and JWKS key lookup."""

    ALGORITHMS = 'RS256'

    def __init__(self, app=None, well_known_config=None, well_known_obj_cache=None, algorithms='RS256', jwks_uri=None, issuer=None, audience=None, client_secret=None, cache=None, caching_enabled=False, jwt_oidc_test_mode=False, jwt_oidc_test_keys=None, jwt_role_callback=None, jwt_oidc_test_private_key_pem=None):
        """Initialize the JWTManager instance."""
        
        self.app = app
        self.well_known_config = well_known_config
        self.well_known_obj_cache = well_known_obj_cache
        self.algorithms = algorithms
        self.jwks_uri = jwks_uri
        self.issuer = issuer
        self.audience = audience
        self.client_secret = client_secret
        self.cache = cache
        self.caching_enabled = caching_enabled

        self.jwt_oidc_test_mode = jwt_oidc_test_mode
        self.jwt_oidc_test_keys = jwt_oidc_test_keys
        self.jwt_oidc_test_private_key_pem = jwt_oidc_test_private_key_pem
        self.jwt_role_callback = jwt_role_callback

        print("Running constructor")
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """Initialize this extension.

        if the config['JWT_OIDC_WELL_KNOWN_CONFIG'] is set, then try to load the JWKS_URI & ISSUER from that
        If it is not set
        attempt to load the JWKS_URI and ISSUE from the application config

        Required settings to function:
        WELL_KNOWN_CONFIG (optional) is this is set, the JWKS_URI & ISSUER will be loaded from there
        JWKS_URI: the endpoint defined for the jwks_keys
        ISSUER: the endpoint for the issuer of the tokens
        ALGORITHMS: only RS256 is supported
        AUDIENCE: the oidc audience (or API_IDENTIFIER)
        CLIENT_SECRET: the shared secret / key assigned to the client (audience)
        """
        self.app = app

        # If the WELL_KNOWN_CONFIG is set, then go fetch the JWKS & ISSUER
        if self.well_known_config:
            # try to get the jwks & issuer from the well known config
            # jurl = urlopen(url=self.well_known_config, context=ssl.SSLContext()) # for gangster testing
            jurl = urlopen(url=self.well_known_config)
            self.well_known_obj_cache = json.loads(
                jurl.read().decode('utf-8'))

            self.jwks_uri = self.well_known_obj_cache['jwks_uri']
            self.issuer = self.well_known_obj_cache['issuer']
        else:
            # TODO: Raise exception
            print('jwks_uri and issuer must be set when creating the jwt manager')

        if self.caching_enabled:
            self.cache = SimpleCache(300)

        app.logger.debug('JWKS_URI: {}'.format(self.jwks_uri))
        app.logger.debug('ISSUER: {}'.format(self.issuer))
        app.logger.debug('ALGORITHMS: {}'.format(self.algorithms))
        app.logger.debug('AUDIENCE: {}'.format(self.audience))
        app.logger.debug('JWT_OIDC_TEST_MODE: {}'.format(self.jwt_oidc_test_mode))
        app.logger.debug('JWT_OIDC_TEST_KEYS: {}'.format(self.jwt_oidc_test_keys))

        # set the auth error handler
        auth_err_handler = JwtManager.handle_auth_error
        app.register_error_handler(AuthError, auth_err_handler)

        app.teardown_appcontext(self.teardown)

    def teardown(self, exception):
        """Remove any module items.

        This is a flask extension lifecycle hook.
        """

    @staticmethod
    def handle_auth_error(ex):
        """Error handler."""
        response = jsonify(ex.error)
        response.status_code = ex.status_code
        return response

    @staticmethod
    def get_token_auth_header():
        """Obtain the access token from the Authorization Header."""
        auth = request.headers.get('Authorization', None)
        if not auth:
            raise AuthError({'code': 'authorization_header_missing',
                             'description': 'Authorization header is expected'}, 401)

        parts = auth.split()

        if parts[0].lower() != 'bearer':
            raise AuthError({'code': 'invalid_header',
                             'description': 'Authorization header must start with Bearer'}, 401)

        if len(parts) < 2:
            raise AuthError({'code': 'invalid_header',
                             'description': 'Token not found after Bearer'}, 401)

        if len(parts) > 2:
            raise AuthError({'code': 'invalid_header',
                             'description': 'Authorization header is an invalid token structure'}, 401)

        return parts[1]

    @staticmethod
    def _get_token_auth_cookie():
        """Obtain the access token from the cookie."""
        cookie_name = current_app.config.get('JWT_OIDC_AUTH_COOKIE_NAME', 'oidc-jwt')
        cookie = request.cookies.get(cookie_name, None)
        if not cookie:
            raise AuthError({'code': 'authorization_cookie_missing',
                             'description': 'Authorization cookie is expected'}, 401)

        return cookie

    def contains_role(self, roles):
        """Check that the listed roles are in the token using the registered callback.

        Args:
            roles [str,]: Comma separated list of valid roles
        """
        token = self.get_token_auth_header()
        unverified_claims = jwt.get_unverified_claims(token)
        roles_in_token = self.jwt_role_callback(
            unverified_claims)
        if any(elem in roles_in_token for elem in roles):
            return True
        return False

    def has_one_of_roles(self, roles):
        """Check that at least one of the roles are in the token using the registered callback.

        Args:
            roles [str,]: Comma separated list of valid roles
        """
        def decorated(f):
            @wraps(f)
            def wrapper(*args, **kwargs):
                self._require_auth_validation(*args, **kwargs)
                if self.contains_role(roles):
                    return f(*args, **kwargs)
                raise AuthError({'code': 'missing_a_valid_role',
                                 'description':
                                     'Missing a role required to access this endpoint'}, 401)
            return wrapper
        return decorated

    def validate_roles(self, required_roles):
        """Check that the listed roles are in the token using the registered callback.

        Args:
            required_roles [str,]: Comma separated list of required roles
        """
        token = self.get_token_auth_header()
        unverified_claims = jwt.get_unverified_claims(token)
        roles_in_token = self.jwt_role_callback(
            unverified_claims)
        if all(elem in roles_in_token for elem in required_roles):
            return True
        return False

    def requires_roles(self, required_roles):
        """Check that the listed roles are in the token using the registered callback.

        Args:
            required_roles [str,]: Comma separated list of required roles
        """
        def decorated(f):
            @wraps(f)
            def wrapper(*args, **kwargs):
                self._require_auth_validation(*args, **kwargs)
                if self.validate_roles(required_roles):
                    return f(*args, **kwargs)
                raise AuthError({'code': 'missing_required_roles',
                                 'description':
                                     'Missing the role(s) required to access this endpoint'}, 401)
            return wrapper
        return decorated

    def requires_auth(self, f):
        """Validate the Bearer Token."""
        @wraps(f)
        def decorated(*args, **kwargs):

            self._require_auth_validation(*args, **kwargs)

            return f(*args, **kwargs)

        return decorated

    def requires_auth_cookie(self, f):
        """Validate the Cookie."""
        @wraps(f)
        def decorated(*args, **kwargs):
            self._require_auth_cookie_validation(*args, **kwargs)

            return f(*args, **kwargs)

        return decorated

    def _require_auth_validation(self, *args, **kwargs):  # pylint: disable=unused-argument
        token = self.get_token_auth_header()
        self._validate_token(token)

    def _require_auth_cookie_validation(self, *args, **kwargs):  # pylint: disable=unused-argument
        token = self._get_token_auth_cookie()
        self._validate_token(token)

    def _validate_token(self, token):
        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.JWTError as jerr:
            raise AuthError({'code': 'invalid_header',
                             'description':
                                 'Invalid header. '
                                 'Use an RS256 signed JWT Access Token'}, 401) from jerr
        if unverified_header['alg'] == 'HS256':
            raise AuthError({'code': 'invalid_header',
                             'description':
                                 'Invalid header. '
                                 'Use an RS256 signed JWT Access Token'}, 401)
        if 'kid' not in unverified_header:
            raise AuthError({'code': 'invalid_header',
                             'description':
                                 'Invalid header. '
                                 'No KID in token header'}, 401)

        rsa_key = self.get_rsa_key(self.get_jwks(), unverified_header['kid'])

        if not rsa_key and self.caching_enabled:
            # Could be key rotation, invalidate the cache and try again
            self.cache.delete('jwks')
            rsa_key = self.get_rsa_key(
                self.get_jwks(), unverified_header['kid'])

        if not rsa_key:
            raise AuthError({'code': 'invalid_header',
                             'description': 'Unable to find jwks key referenced in token'}, 401)

        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=self.algorithms,
                audience=self.audience,
                issuer=self.issuer
            )
            _request_ctx_stack.top.current_user = g.jwt_oidc_token_info = payload
        except jwt.ExpiredSignatureError as sig:
            raise AuthError({'code': 'token_expired',
                             'description': 'token has expired'}, 401) from sig
        except jwt.JWTClaimsError as jwe:
            raise AuthError({'code': 'invalid_claims',
                             'description':
                                 'incorrect claims,'
                                 ' please check the audience and issuer'}, 401) from jwe
        except Exception as exc:
            raise AuthError({'code': 'invalid_header',
                             'description':
                                 'Unable to parse authentication'
                                 ' token.'}, 401) from exc

    def get_jwks(self):
        """Return the test, cached or fetched JWKS for the KID provided."""
        if self.jwt_oidc_test_mode:
            return self.jwt_oidc_test_keys

        if self.caching_enabled:
            return self._get_jwks_from_cache()
        return self._fetch_jwks_from_url()

    def _get_jwks_from_cache(self):
        jwks = self.cache.get('jwks')
        if jwks is None:
            jwks = self._fetch_jwks_from_url()
            self.cache.set('jwks', jwks)
        return jwks

    def _fetch_jwks_from_url(self):
        jsonurl = urlopen(self.jwks_uri)
        return json.loads(jsonurl.read().decode('utf-8'))

    def create_jwt(self, claims, header):
        """Create a token for the client and JWKS kid provided."""
        token = jwt.encode(
            claims, self.jwt_oidc_test_private_key_pem, headers=header, algorithm='RS256')
        return token

    @staticmethod
    def get_rsa_key(jwks, kid):
        """Return the matching RSA key for kid, from the jwks array."""
        rsa_key = {}
        for key in jwks['keys']:
            if key['kid'] == kid:
                rsa_key = {
                    'kty': key['kty'],
                    'kid': key['kid'],
                    'use': key['use'],
                    'n': key['n'],
                    'e': key['e']
                }
        return rsa_key
