import logging
import os

from flask_caching import Cache
from flask import Flask
from app.flask_jwt_oidc_local.exceptions import AuthError
from app.flask_jwt_oidc_local import JwtManager
from flask_sqlalchemy import SQLAlchemy
from app.config import TestConfig
from jose import jwt as jwt_jose
from .config import Config
from .helper import Api

def JWT_ROLE_CALLBACK(jwt_dict):
    return (jwt_dict.get('client_roles') or [])

def JWT_ROLE_CALLBACK_V1(jwt_dict):
        return (jwt_dict['realm_access']['roles'])

def get_jwt_by_audience(aud):
    audience_jwt_map = {
        'JWT_OIDC_AUDIENCE': jwtv2,
        'JWT_OIDC_AUDIENCE_BCMI': jwt_bcmi,
        'JWT_OIDC_AUDIENCE_FNCS': jwt_fncs,
        'JWT_OIDC_AUDIENCE_GENTAX': jwt_gentax,
        'JWT_OIDC_AUDIENCE_NRIS': jwt_nris,
        'JWT_OIDC_AUDIENCE_VFCBC': jwt_vfcbc,
        'JWT_OIDC_AUDIENCE_BCGW': jwt_bcgw,
    }

    for audience_env, jwt_value in audience_jwt_map.items():
        if os.environ.get(audience_env) in aud:
            return jwt_value

    return None

db = SQLAlchemy()

# Gold SSO
jwtv2 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
# Existing Keycloak for integration clients
jwtv1 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_V1'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_V1'), None, None, False, False, None, JWT_ROLE_CALLBACK_V1, None)

# Gold SSO - Register Config Per Integration Client: 

jwt_bcmi = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_BCMI'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_BCMI'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
jwt_fncs = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_FNCS'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_FNCS'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
jwt_gentax = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_GENTAX'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_GENTAX'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
jwt_nris = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_NRIS'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_NRIS'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
jwt_vfcbc = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_VFCBC'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_VFCBC'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
jwt_bcgw = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_BCGW'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_BCGW'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)


# Test JWT Config for integration tests
test_config = TestConfig()
jwt = JwtManager(None, test_config.JWT_OIDC_WELL_KNOWN_CONFIG, None, 'RS256', None, None, test_config.JWT_OIDC_TEST_AUDIENCE, None, None, False, True, test_config.JWT_OIDC_TEST_KEYS, JWT_ROLE_CALLBACK, test_config.JWT_OIDC_TEST_PRIVATE_KEY_PEM)

def getJwtManager():
    kc_realms = 'oidc.gov.bc.ca'
    auth_header = jwt.get_token_auth_header()
    token = jwt_jose.get_unverified_claims(auth_header)

    iss = token.get('iss')
    aud = token.get('aud')

    if kc_realms in iss:
        print(f"\n **Client from oidc.gov.bc.ca Detected - Client ID: {aud}\n")
        return jwtv1

    if iss in test_config.JWT_OIDC_TEST_ISSUER:
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
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')

if Config.FLASK_LOGGING_LEVEL == 'DEBUG':
    # Have engine logs included at INFO level when pod debug set to DEBUG
    logging.basicConfig()
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
