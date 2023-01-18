import logging
import os

from flask_caching import Cache
from flask import Flask
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

db = SQLAlchemy()

# Gold SSO
jwtv2 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
# Existing Keycloak for integration clients
jwtv1 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_V1'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_V1'), None, None, False, False, None, JWT_ROLE_CALLBACK_V1, None)
# Test JWT Config for integration tests
test_config = TestConfig()
jwt = JwtManager(None, test_config.JWT_OIDC_WELL_KNOWN_CONFIG, None, 'RS256', None, None, test_config.JWT_OIDC_TEST_AUDIENCE, None, None, False, True, test_config.JWT_OIDC_TEST_KEYS, JWT_ROLE_CALLBACK, test_config.JWT_OIDC_TEST_PRIVATE_KEY_PEM)

def getJwtManager():
    gold_sso = 'loginproxy.gov.bc.ca'
    kc_realms = 'oidc.gov.bc.ca'
    
    auth_header = jwt.get_token_auth_header()
    token = jwt_jose.get_unverified_claims(auth_header)

    iss = token.get('iss')

    if gold_sso in iss:
        return jwtv2

    if kc_realms in iss:
        print("\n **Client from oidc.gov.bc.ca Detected \n")
        return jwtv1

    # TODO: default return and throw error if none of iss is found in tokens without affecting TEST config
    return jwt


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
