import logging
import os

from dotenv import load_dotenv, find_dotenv
from celery.schedules import crontab
from flask import current_app
from opentelemetry import trace
import requests


ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)



class CustomFormatter(logging.Formatter):
    def format(self, record):
        KEY_CLOAK_CLIENT_ID = None
        def get_key_cloak_client_id():
            try:
                # Check if the request is a valid HTTP request
                if current_app and hasattr(current_app, 'extensions'):
                    from app.extensions import getJwtManager
                    if getJwtManager().audience:
                        return getJwtManager().audience
            except Exception as e:
                # Handle the exception here (e.g., log it)
                print(f"An error occurred: {e}")

            return None

        def get_traceid_from_telemetry():
            current_span = trace.get_current_span()
            if current_span:
                traceid = current_span.get_span_context().trace_id
                return traceid
            return None

        # Get the traceid from the telemetry
        traceid = get_traceid_from_telemetry()

        # Add the traceid to the log message
        record.traceid = traceid
        if get_key_cloak_client_id() and not KEY_CLOAK_CLIENT_ID:
            KEY_CLOAK_CLIENT_ID = get_key_cloak_client_id()

        # Call the parent formatter to format the log message
        formatted_message = super().format(record)

        # Add the traceid, keycloak client id and message to the formatted log message
        formatted_message = f'{formatted_message} [trace_id={traceid} client={KEY_CLOAK_CLIENT_ID}]: {record.message}'

        return formatted_message


class Config(object):
    # Environment config
    FLASK_LOGGING_LEVEL = os.environ.get('FLASK_LOGGING_LEVEL',
                                         'INFO')                # ['DEBUG','INFO','WARN','ERROR','CRITICAL']

    LOGGING_DICT_CONFIG = {
        'version': 1,
        'formatters': {
            'default': {
                '()': CustomFormatter,
                'format': '%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d]',
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'stream': 'ext://sys.stdout',
                'formatter': 'default',
                'level': 'DEBUG'
            },
            'file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'mode': 'a',
                'backupCount': 0,
                'maxBytes': 100000000,
                'filename': '/var/log/core-api.log',
                'formatter': 'default',
            }
        },
        'root': {
            'level': FLASK_LOGGING_LEVEL,
            'handlers': ['file', 'console']
        },
        'loggers': {
            'werkzeug': {
                'level': 'CRITICAL',
                'propagate': False
            }
        }
    }

    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    BASE_PATH = os.environ.get('BASE_PATH', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'user')
    DB_PASS = os.environ.get('DB_PASS', 'pass')
    DB_PORT = os.environ.get('DB_PORT', 5432)
    DB_NAME = os.environ.get('DB_NAME', 'db_name')
    DB_URL = "postgresql://{0}:{1}@{2}:{3}/{4}".format(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME)
    NRIS_USER_NAME = os.environ.get('NRIS_USER_NAME', None)
    NRIS_PASS = os.environ.get('NRIS_PASS', None)
    ENVIRONMENT_NAME = os.environ.get('ENVIRONMENT_NAME', 'dev')
    CORE_PRODUCTION_URL = os.environ.get('CORE_PRODUCTION_URL',
                                         'https://minesdigitalservices.gov.bc.ca')
    MINESPACE_PRODUCTION_URL = os.environ.get('MINESPACE_PRODUCTION_URL',
                                              'https://minespace.gov.bc.ca')
    MDS_NO_REPLY_EMAIL = os.environ.get('MDS_NO_REPLY_EMAIL', 'noreply-mds@gov.bc.ca')
    MDS_EMAIL = os.environ.get('MDS_EMAIL', 'mds@gov.bc.ca')
    MAJOR_MINES_OFFICE_EMAIL = os.environ.get('MAJOR_MINES_OFFICE_EMAIL', 'PermRecl@gov.bc.ca')
    EMA_AUTH_LINK = os.environ.get(
        'EMA_AUTH_LINK',
        'https://www2.gov.bc.ca/gov/content/environment/waste-management/waste-discharge-authorization'
    )

    # SqlAlchemy config
    SQLALCHEMY_DATABASE_URI = DB_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    JWT_OIDC_WELL_KNOWN_CONFIG = os.environ.get(
        'JWT_OIDC_WELL_KNOWN_CONFIG',
        'https://URL/auth/realms/mds/.well-known/openid-configuration')
    JWT_OIDC_AUDIENCE = os.environ.get('JWT_OIDC_AUDIENCE', 'mds')
    JWT_OIDC_ALGORITHMS = os.environ.get('JWT_OIDC_ALGORITHMS', 'RS256')

    LDAP_IDIR_USERNAME = os.environ.get('LDAP_IDIR_USERNAME', "idir_username")
    LDAP_IDIR_PASSWORD = os.environ.get('LDAP_IDIR_PASSWORD', "idir_password")

    METABASE_SITE_URL = os.environ.get('METABASE_SITE_URL', None)
    METABASE_EMBEDDING_SECRET_KEY = os.environ.get('METABASE_EMBEDDING_SECRET_KEY', None)

    BUNDLE_ERRORS = True     #RequestParser global config

    def JWT_ROLE_CALLBACK(jwt_dict):
        return (jwt_dict.get('client_roles') or [])

    # Below enables functionalty we PR'd into the JWT_OIDC library to add caching
    JWT_OIDC_CACHING_ENABLED = True

    # Microservice URLs
    DOCUMENT_MANAGER_URL = os.environ.get('DOCUMENT_MANAGER_URL',
                                          'http://document_manager_backend:5001')
    DOCUMENT_GENERATOR_URL = os.environ.get('DOCUMENT_GENERATOR_URL',
                                            'http://docgen-api:3030/api/v2')
    DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES = int(
        os.environ.get('DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES', '1048576'))
    NRIS_TOKEN_URL = os.environ.get('NRIS_TOKEN_URL', None)
    NRIS_API_URL = os.environ.get('NRIS_API_URL', 'http://nris_backend:5500')

    NROS_NOW_URL = os.environ.get('NROS_NOW_URL', None)
    NROS_NOW_CLIENT_ID = os.environ.get('NROS_NOW_CLIENT_ID', None)
    NROS_NOW_TOKEN_URL = os.environ.get('NROS_NOW_TOKEN_URL', None)
    NROS_NOW_CLIENT_SECRET = os.environ.get('NROS_NOW_CLIENT_SECRET', None)
    

    # Cache settings
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'redis')
    CACHE_REDIS_HOST = os.environ.get('CACHE_REDIS_HOST', 'redis')
    CACHE_REDIS_PORT = os.environ.get('CACHE_REDIS_PORT', 6379)
    CACHE_REDIS_PASS = os.environ.get('CACHE_REDIS_PASS', 'keycloak-password')
    CACHE_REDIS_URL = 'redis://:{0}@{1}:{2}'.format(CACHE_REDIS_PASS, CACHE_REDIS_HOST,
                                                    CACHE_REDIS_PORT)
    #removing flask restplus default header mask for swagger.
    RESTPLUS_MASK_SWAGGER = False

    # Constant config
    RESTPLUS_JSON = {'indent': None, 'separators': (',', ':')}
    COMPRESS_LEVEL = 9
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {'pool_timeout': 300, 'max_overflow': 20}

    # Flagsmith
    FLAGSMITH_URL=os.environ.get('FLAGSMITH_URL', 'https://mds-flags-dev.apps.silver.devops.gov.bc.ca/api/v1/')
    FLAGSMITH_KEY=os.environ.get('FLAGSMITH_KEY', '4Eu9eEMDmWVEHKDaKoeWY7')

    # Enable flag caching and evalutation. If set to True, FLAGSMITH_KEY must be set to a server side FLAGSMITH_KEY
    FLAGSMITH_ENABLE_LOCAL_EVALUTION=os.environ.get('FLAGSMITH_ENABLE_LOCAL_EVALUTION', 'false') == 'true'

    # NROS
    NROS_CLIENT_SECRET = os.environ.get('NROS_CLIENT_SECRET', None)
    NROS_CLIENT_ID = os.environ.get('NROS_CLIENT_ID', None)
    NROS_TOKEN_URL = os.environ.get('NROS_TOKEN_URL', None)

    # vFCBC
    VFCBC_CLIENT_SECRET = os.environ.get('VFCBC_CLIENT_SECRET', None)
    VFCBC_CLIENT_ID = os.environ.get('VFCBC_CLIENT_ID', None)

    # NRIS
    NRIS_REMOTE_CLIENT_SECRET = os.environ.get('NRIS_REMOTE_CLIENT_SECRET', None)
    NRIS_REMOTE_CLIENT_ID = os.environ.get('NRIS_REMOTE_CLIENT_ID', None)
    NRIS_REMOTE_TOKEN_URL = os.environ.get('NRIS_REMOTE_TOKEN_URL', None)

    # OrgBook
    ORGBOOK_API_URL = os.environ.get('ORGBOOK_API_URL', 'https://orgbook.gov.bc.ca/api/v2/')

    # NRPTI
    NRPTI_API_URL = os.environ.get(
        'NRPTI_API_URL', 'https://nrpti-api-f00029-prod.apps.silver.devops.gov.bc.ca/api/public/')

    # EPIC
    EPIC_API_URL = os.environ.get('EPIC_API_URL', 'https://projects.eao.gov.bc.ca/api/v2/')
    EPIC_LINK_URL = os.environ.get('EPIC_LINK_URL', 'https://projects.eao.gov.bc.ca/p/')

    # MDT-Issuer-Controller
    VCR_ISSUER_URL = os.environ.get(
        'VCR_ISSUER_URL',
        'https://mines-permitting-issuer-a3e512-dev.apps.silver.devops.gov.bc.ca/')
    VCR_ISSUER_SECRET_KEY = os.environ.get('VCR_ISSUER_SECRET_KEY', 'super-secret-key')

    # Common Services
    COMMON_SERVICES_CLIENT_ID = os.environ.get('COMMON_SERVICES_CLIENT_ID')
    COMMON_SERVICES_CLIENT_SECRET = os.environ.get('COMMON_SERVICES_CLIENT_SECRET')
    COMMON_SERVICES_AUTH_HOST = os.environ.get('COMMON_SERVICES_AUTH_HOST')
    COMMON_SERVICES_EMAIL_HOST = os.environ.get('COMMON_SERVICES_EMAIL_HOST')
    EMAIL_ENABLED = os.environ.get('EMAIL_ENABLED', False)
    EMAIL_RECIPIENT_OVERRIDE = os.environ.get('EMAIL_RECIPIENT_OVERRIDE')

    # CSS Keycloak SSO
    CSS_CLIENT_ID = os.environ.get('CSS_CLIENT_ID')
    CSS_CLIENT_SECRET = os.environ.get('CSS_CLIENT_SECRET')
    CSS_TOKEN_URL = os.environ.get('CSS_TOKEN_URL')
    CSS_API_URL = os.environ.get('CSS_API_URL')
    CSS_ENV = 'test' if ENVIRONMENT_NAME == 'local' else ENVIRONMENT_NAME

    #Templates
    TEMPLATE_FOLDER_BASE = os.environ.get('TEMPLATE_FOLDER_BASE', 'templates')
    TEMPLATE_FOLDER_IRT = os.environ.get('TEMPLATE_FOLDER_IRT', f'{TEMPLATE_FOLDER_BASE}/project/')
    TEMPLATE_IRT = os.environ.get('TEMPLATE_IRT', 'IRT_Template.xlsx')

    # Celery settings
    CELERY_RESULT_BACKEND = f'db+postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    CELERY_BROKER_URL = f'redis://:{CACHE_REDIS_PASS}@{CACHE_REDIS_HOST}:{CACHE_REDIS_PORT}'
    CELERY_READBEAT_BROKER_URL = f'{CELERY_BROKER_URL}'
    CELERY_DEFAULT_QUEUE = 'core_tasks'


    CELERY_BEAT_SCHEDULE = {
        'notify_expiring_party_appointments': {
            'task': 'app.api.parties.party_appt.tasks.notify_expiring_party_appointments',
            'schedule': crontab(minute="*/15"),
        },
        'notify_and_update_expired_party_appointments': {
            'task': 'app.api.parties.party_appt.tasks.notify_and_update_expired_party_appointments',
            'schedule': crontab(minute="*/15"),
        },

    }
    #Traction Verifiable Credentials DEFAULTS ARE FOR DEV
    TRACTION_HOST = os.environ.get("TRACTION_HOST","https://traction-tenant-proxy-dev.apps.silver.devops.gov.bc.ca")
    TRACTION_TENANT_ID = os.environ.get("TRACTION_TENANT_ID","GET_TENANT_ID_FROM_TRACTION")
    TRACTION_WALLET_API_KEY = os.environ.get("TRACTION_WALLET_API_KEY","GET_WALLET_API_KEY_FROM_TRACTION")

    CRED_DEF_ID_MINES_ACT_PERMIT = os.environ.get("CRED_DEF_ID_MINES_ACT_PERMIT","CRED_DEF_ID_MINES_ACT_PERMIT")

class TestConfig(Config):
    # The following configs are for testing purposes and all variables and keys are generated using dummy data.
    TESTING = os.environ.get('TESTING', True)
    CACHE_TYPE = "simple"
    DB_NAME_TEST = os.environ.get('DB_NAME_TEST', 'db_name_test')
    DB_URL = "postgresql://{0}:{1}@{2}:{3}/{4}".format(Config.DB_USER, Config.DB_PASS,
                                                       Config.DB_HOST, Config.DB_PORT, DB_NAME_TEST)
    SQLALCHEMY_DATABASE_URI = DB_URL
    JWT_OIDC_TEST_MODE = True
    JWT_OIDC_TEST_AUDIENCE = "test_audience"
    JWT_OIDC_TEST_CLIENT_SECRET = "test_secret"
    JWT_OIDC_TEST_ISSUER = "test_issuer"
    # Dummy Private Keys for testing purposes, can replace these keys with any other generated key.

    JWT_OIDC_TEST_KEYS = {
        "keys": [{
            "kid": "flask-jwt-oidc-test-client",
            "kty": "RSA",
            "alg": "RS256",
            "use": "sig",
            "n":
            "AN-fWcpCyE5KPzHDjigLaSUVZI0uYrcGcc40InVtl-rQRDmAh-C2W8H4_Hxhr5VLc6crsJ2LiJTV_E72S03pzpOOaaYV6-TzAjCou2GYJIXev7f6Hh512PuG5wyxda_TlBSsI-gvphRTPsKCnPutrbiukCYrnPuWxX5_cES9eStR",
            "e": "AQAB"
        }]
    }
    # Dummy Private Keys for testing purposes.
    JWT_OIDC_TEST_PRIVATE_KEY_JWKS = {
        "keys": [{
            "kid":
            "flask-jwt-oidc-test-client",
            "kty":
            "RSA",
            "alg":
            "RS256",
            "use":
            "sig",
            "kty":
            "RSA",
            "n":
            "AN-fWcpCyE5KPzHDjigLaSUVZI0uYrcGcc40InVtl-rQRDmAh-C2W8H4_Hxhr5VLc6crsJ2LiJTV_E72S03pzpOOaaYV6-TzAjCou2GYJIXev7f6Hh512PuG5wyxda_TlBSsI-gvphRTPsKCnPutrbiukCYrnPuWxX5_cES9eStR",
            "e":
            "AQAB",
            "d":
            "C0G3QGI6OQ6tvbCNYGCqq043YI_8MiBl7C5dqbGZmx1ewdJBhMNJPStuckhskURaDwk4-8VBW9SlvcfSJJrnZhgFMjOYSSsBtPGBIMIdM5eSKbenCCjO8Tg0BUh_xa3CHST1W4RQ5rFXadZ9AeNtaGcWj2acmXNO3DVETXAX3x0",
            "p":
            "APXcusFMQNHjh6KVD_hOUIw87lvK13WkDEeeuqAydai9Ig9JKEAAfV94W6Aftka7tGgE7ulg1vo3eJoLWJ1zvKM",
            "q":
            "AOjX3OnPJnk0ZFUQBwhduCweRi37I6DAdLTnhDvcPTrrNWuKPg9uGwHjzFCJgKd8KBaDQ0X1rZTZLTqi3peT43s",
            "dp":
            "AN9kBoA5o6_Rl9zeqdsIdWFmv4DB5lEqlEnC7HlAP-3oo3jWFO9KQqArQL1V8w2D4aCd0uJULiC9pCP7aTHvBhc",
            "dq":
            "ANtbSY6njfpPploQsF9sU26U0s7MsuLljM1E8uml8bVJE1mNsiu9MgpUvg39jEu9BtM2tDD7Y51AAIEmIQex1nM",
            "qi":
            "XLE5O360x-MhsdFXx8Vwz4304-MJg-oGSJXCK_ZWYOB_FGXFRTfebxCsSYi0YwJo-oNu96bvZCuMplzRI1liZw"
        }]
    }
    # Dummy Private Key, for testing purposes.
    JWT_OIDC_TEST_PRIVATE_KEY_PEM = """
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDfn1nKQshOSj8xw44oC2klFWSNLmK3BnHONCJ1bZfq0EQ5gIfg
tlvB+Px8Ya+VS3OnK7Cdi4iU1fxO9ktN6c6TjmmmFevk8wIwqLthmCSF3r+3+h4e
ddj7hucMsXWv05QUrCPoL6YUUz7Cgpz7ra24rpAmK5z7lsV+f3BEvXkrUQIDAQAB
AoGAC0G3QGI6OQ6tvbCNYGCqq043YI/8MiBl7C5dqbGZmx1ewdJBhMNJPStuckhs
kURaDwk4+8VBW9SlvcfSJJrnZhgFMjOYSSsBtPGBIMIdM5eSKbenCCjO8Tg0BUh/
xa3CHST1W4RQ5rFXadZ9AeNtaGcWj2acmXNO3DVETXAX3x0CQQD13LrBTEDR44ei
lQ/4TlCMPO5bytd1pAxHnrqgMnWovSIPSShAAH1feFugH7ZGu7RoBO7pYNb6N3ia
C1idc7yjAkEA6Nfc6c8meTRkVRAHCF24LB5GLfsjoMB0tOeEO9w9Ous1a4o+D24b
AePMUImAp3woFoNDRfWtlNktOqLel5PjewJBAN9kBoA5o6/Rl9zeqdsIdWFmv4DB
5lEqlEnC7HlAP+3oo3jWFO9KQqArQL1V8w2D4aCd0uJULiC9pCP7aTHvBhcCQQDb
W0mOp436T6ZaELBfbFNulNLOzLLi5YzNRPLppfG1SRNZjbIrvTIKVL4N/YxLvQbT
NrQw+2OdQACBJiEHsdZzAkBcsTk7frTH4yGx0VfHxXDPjfTj4wmD6gZIlcIr9lZg
4H8UZcVFN95vEKxJiLRjAmj6g273pu9kK4ymXNEjWWJn
-----END RSA PRIVATE KEY-----"""
