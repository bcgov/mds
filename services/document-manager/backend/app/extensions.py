import os

from flask_caching import Cache

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from .config import Config, TestConfig
from .flask_jwt_oidc_local import JwtManager
from .helper import Api
from app.flask_jwt_oidc_local.exceptions import AuthError
from jose import jwt as jwt_jose

def get_jwt_by_audience(aud):
    audience_jwt_map = {
        'JWT_OIDC_AUDIENCE': jwt_main,
        'JWT_OIDC_AUDIENCE_CYPRESS': jwt_cypress,
    }

    for audience_env, jwt_value in audience_jwt_map.items():
        token_audience = os.environ.get(audience_env)

        if token_audience and token_audience in aud:
            return jwt_value

    return None

db = SQLAlchemy()
migrate = Migrate()

jwt_main = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE'), None, None, False, False, None, Config.JWT_ROLE_CALLBACK, None)

# Cypress JWT Config

# Note: When using Cypress locally, JWT_OIDC_WELL_KNOWN_CONFIG_CYPRESS is available at http://keycloak:8080 seeing as it's running within docker,
# whereas the ISSUER check must happen with http://localhost:8080. Hence we require both JWT_OIDC_WELL_KNOWN_CONFIG_CYPRESS and JWT_OIDC_ISSUER_CYPRESS in this case.
jwt_cypress = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_CYPRESS'), None, 'RS256', None, os.environ.get('JWT_OIDC_ISSUER_CYPRESS'), os.environ.get('JWT_OIDC_AUDIENCE_CYPRESS'), None, None, False, False, None, Config.JWT_ROLE_CALLBACK, None)

# Test JWT Config for integration tests
test_config = TestConfig()

jwt = JwtManager(None, test_config.JWT_OIDC_WELL_KNOWN_CONFIG, None, 'RS256', None, None, test_config.JWT_OIDC_TEST_AUDIENCE, None, None, False, True, test_config.JWT_OIDC_TEST_KEYS, Config.JWT_ROLE_CALLBACK, test_config.JWT_OIDC_TEST_PRIVATE_KEY_PEM)
def getJwtManager():
    legacy_token_issuer = 'oidc.gov.bc.ca'
    auth_header = jwt.get_token_auth_header()
    token = jwt_jose.get_unverified_claims(auth_header)

    iss = token.get('iss')
    aud = token.get('aud')

    if legacy_token_issuer in iss:
        print(f"\n **Client from oidc.gov.bc.ca Detected - Client ID: {aud}\n")
        raise AuthError({'code': 'auth_fail',
                    'description': 'Token issuer oidc.gov.bc.ca is no longer supported. Please contact the mds team.'}, 401)

    if test_config.JWT_OIDC_TEST_ISSUER is not None and iss in test_config.JWT_OIDC_TEST_ISSUER:
        jwt_result = jwt
    else:
        jwt_result = get_jwt_by_audience(aud)

    if jwt_result is not None:
        return jwt_result
    else:
        raise AuthError({'code': 'auth_fail',
                             'description': 'Unable to select JWT Manager: Unknown Issuer'}, 401)
cache = Cache()
api = Api(
    prefix=f'{Config.BASE_PATH}',
    doc=f'{Config.BASE_PATH}/',
    default='document_manager',
    default_label='Document storage and management')
