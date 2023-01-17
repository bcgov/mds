import logging
import os

from flask_caching import Cache
from flask import Flask
from app.flask_jwt_oidc_local import JwtManager
from flask_sqlalchemy import SQLAlchemy

# from app.api.utils.include.user_info import User
from .config import Config
from .helper import Api

def JWT_ROLE_CALLBACK(jwt_dict):
    return (jwt_dict.get('client_roles') or [])

db = SQLAlchemy()

# Gold SSO
jwt = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE'), None, None, False, False, None, JWT_ROLE_CALLBACK)
# Existing Keycloak for integration clients
# jwtv1 = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG_V1'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE_V1'), None, None, False, False, None, JWT_ROLE_CALLBACK)

# def getJWT():

#     raw_info = User().get_user_raw_info()
#     sa_role = 'service_account'
#     kc_realms = ["https://test.oidc.gov.bc.ca/auth/realms/mds", "https://oidc.gov.bc.ca/auth/realms/mds"]
#     gold_sso = 'loginproxy.gov.bc.ca'

#     iss = raw_info.get('iss')

#     # Skip if Gold SSo
#     if gold_sso in iss: 
#         return

#     # Old SSO Service Accounts should have proper role.
#     roles = raw_info.get('realm_access').get('roles')
#     if iss in kc_realms and sa_role in roles:
#         print("\n **Allow this service account via old KC Realm** \n")
#         return True
#     else:
#         print("\n **Disallow this service account via old KC Realm** \n")


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
