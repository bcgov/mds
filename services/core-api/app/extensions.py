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

test_config = TestConfig()

# Gold SSO
jwtv2 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE'), None, None, False, False, None, JWT_ROLE_CALLBACK, None)
# Existing Keycloak for integration clients
jwtv1 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_V1'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_V1'), None, None, False, False, None, JWT_ROLE_CALLBACK_V1, None)

jwt = JwtManager(None, test_config.JWT_OIDC_WELL_KNOWN_CONFIG, None, 'RS256', None, None, test_config.JWT_OIDC_TEST_AUDIENCE, None, None, False, True, test_config.JWT_OIDC_TEST_KEYS, JWT_ROLE_CALLBACK, test_config.JWT_OIDC_TEST_PRIVATE_KEY_PEM)

def getJwtManager():
    sa_role = 'service_account'
    gold_sso = 'loginproxy.gov.bc.ca'
    kc_realms = 'oidc.gov.bc.ca'
    
    auth_header = jwt.get_token_auth_header()
    token = jwt_jose.get_unverified_claims(auth_header)

    iss = token.get('iss')


    # Skip if Gold SSS
    if gold_sso in iss:
        print(jwtv2.audience)
        print(jwtv2.well_known_config)
        return jwtv2

    # Old SSO Service Accounts should have SA role.
    # roles = token.get('realm_access').get('roles')

    if kc_realms in iss: # and sa_role in roles:
        print("\n **Service Account from oidc.gov.bc.ca Detected \n")
        print(jwtv1.audience)
        print(jwtv1.well_known_config)
        return jwtv1

    return jwt
    # TODO: default return and throw error if none of iss is found in tokens 


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
