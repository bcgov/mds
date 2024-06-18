import os

from dotenv import load_dotenv, find_dotenv


class Config(object):

    FLASK_LOGGING_LEVEL = os.environ.get('FLASK_LOGGING_LEVEL',
                                         'INFO')                # ['DEBUG','INFO','WARN','ERROR','CRITICAL']
    WERKZEUG_LOGGING_LEVEL = os.environ.get('WERKZEUG_LOGGING_LEVEL',
                                         'CRITICAL')  # ['DEBUG','INFO','WARN','ERROR','CRITICAL']
    DISPLAY_WERKZEUG_LOG = os.environ.get('DISPLAY_WERKZEUG_LOG',
                                            True)

    LOGGING_DICT_CONFIG = {
        'version': 1,
        'formatters': {
            'default': {
                'format': '%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d]',
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'stream': 'ext://sys.stdout',
                'formatter': 'default',
                'level': 'DEBUG'
            }
        },
        'root': {
            'level': FLASK_LOGGING_LEVEL,
            'handlers': ['console']
        },
        'loggers': {
            'werkzeug': {
                'level': WERKZEUG_LOGGING_LEVEL,
                'handlers': ['console'],
                'propagate': DISPLAY_WERKZEUG_LOG
            }
        }
    }

    # Environment config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    BASE_PATH = os.environ.get('BASE_PATH', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'user')
    DB_PASS = os.environ.get('DB_PASS', 'pass')
    DB_PORT = os.environ.get('DB_PORT', 5432)
    DB_NAME = os.environ.get('DB_NAME', 'db_name')
    DB_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    ENVIRONMENT_NAME = os.environ.get('ENVIRONMENT_NAME', 'dev')
    RESTX_MASK_SWAGGER = False
    # SqlAlchemy config
    SQLALCHEMY_DATABASE_URI = DB_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    JWT_OIDC_WELL_KNOWN_CONFIG = os.environ.get(
        'JWT_OIDC_WELL_KNOWN_CONFIG',
        'https://localhost:8080/auth/realms/mds/.well-known/openid-configuration')
    JWT_OIDC_AUDIENCE = os.environ.get('JWT_OIDC_AUDIENCE', 'mds')
    JWT_OIDC_ALGORITHMS = os.environ.get('JWT_OIDC_ALGORITHMS', 'RS256')

    NRIS_DB_USER = os.environ.get('NRIS_DB_USER', 'localhost')
    NRIS_DB_PASSWORD = os.environ.get('NRIS_DB_PASSWORD', 'localhost')
    NRIS_DB_PORT = os.environ.get('NRIS_DB_PORT', 'localhost')
    NRIS_DB_SERVICENAME = os.environ.get('NRIS_DB_SERVICENAME', 'localhost')
    NRIS_DB_HOSTNAME = os.environ.get('NRIS_DB_HOSTNAME', 'localhost')
    NRIS_SERVER_CERT_DN = os.environ.get('NRIS_SERVER_CERT_DN', 'localhost')

    # Cache settings
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'redis')
    CACHE_REDIS_HOST = os.environ.get('CACHE_REDIS_HOST', 'redis')
    CACHE_REDIS_PORT = os.environ.get('CACHE_REDIS_PORT', 6379)
    CACHE_REDIS_PASS = os.environ.get('CACHE_REDIS_PASS', 'redis-password')
    CACHE_REDIS_URL = 'redis://:{0}@{1}:{2}'.format(CACHE_REDIS_PASS, CACHE_REDIS_HOST,
                                                    CACHE_REDIS_PORT)

    def JWT_ROLE_CALLBACK(jwt_dict):
        return (jwt_dict.get('client_roles') or [])


class TestConfig(Config):
    TESTING = os.environ.get('TESTING', True)

    DB_NAME = os.environ.get('DB_NAME_TEST', 'db_name_test')
    DB_URL = f"postgresql://{Config.DB_USER}:{Config.DB_PASS}@{Config.DB_HOST}:{Config.DB_PORT}/{DB_NAME}"
    SQLALCHEMY_DATABASE_URI = DB_URL

    NRIS_DB_USER = os.environ.get('NRIS_DB_USER', 'localhost')
    NRIS_DB_PASSWORD = os.environ.get('NRIS_DB_PASSWORD', 'localhost')
    NRIS_DB_PORT = os.environ.get('NRIS_DB_PORT', 'localhost')
    NRIS_DB_SERVICENAME = os.environ.get('NRIS_DB_SERVICENAME', 'localhost')
    NRIS_DB_HOSTNAME = os.environ.get('NRIS_DB_HOSTNAME', 'localhost')
    NRIS_SERVER_CERT_DN = os.environ.get('NRIS_SERVER_CERT_DN', 'localhost')

    JWT_OIDC_TEST_MODE = True
    JWT_OIDC_TEST_AUDIENCE = os.environ.get('JWT_OIDC_TEST_AUDIENCE', None)
    JWT_OIDC_TEST_CLIENT_SECRET = os.environ.get('JWT_OIDC_TEST_CLIENT_SECRET', None)
    JWT_OIDC_TEST_ISSUER = os.environ.get('JWT_OIDC_TEST_ISSUER', None)
    
    KID_KEY = os.environ.get('JWT_OIDC_KEY_KID', None)
    KTY_KEY = os.environ.get('JWT_OIDC_KEY_KTY', None)
    ALG_KEY = os.environ.get('JWT_OIDC_KEY_ALG', None)
    USE_KEY = os.environ.get('JWT_OIDC_KEY_USE', None)
    N_KEY = os.environ.get('JWT_OIDC_KEY_N', None)
    E_KEY = os.environ.get('JWT_OIDC_KEY_E', None)
    D_KEY = os.environ.get('JWT_OIDC_KEY_D', None)
    P_KEY = os.environ.get('JWT_OIDC_KEY_P', None)
    Q_KEY = os.environ.get('JWT_OIDC_KEY_Q', None)
    DP_KEY = os.environ.get('JWT_OIDC_KEY_DP', None)
    DQ_KEY = os.environ.get('JWT_OIDC_KEY_DQ', None)
    QI_KEY = os.environ.get('JWT_OIDC_KEY_QI', None)

    # Dummy Private Keys for testing purposes, can replace these keys with any other generated key.
    JWT_OIDC_TEST_KEYS = {
        "keys": [{
            "kid": KID_KEY,
            "kty": KTY_KEY,
            "alg": ALG_KEY,
            "use": USE_KEY,
            "n": N_KEY,
            "e": E_KEY
        }]
    }
    # Dummy Private Keys for testing purposes.
    JWT_OIDC_TEST_PRIVATE_KEY_JWKS = {
        "keys": [{
            "kid": KID_KEY,
            "kty": KTY_KEY,
            "alg": ALG_KEY,
            "use": USE_KEY,
            "kty": KTY_KEY,
            "n": N_KEY,
            "e": E_KEY,
            "d": D_KEY,
            "p": P_KEY,
            "q": Q_KEY,
            "dp": DP_KEY,
            "dq": DQ_KEY,
            "qi": QI_KEY
        }]
    }
    # Dummy Private Key, for testing purposes.
    JWT_OIDC_TEST_PRIVATE_KEY_PEM = os.environ.get('JWT_OIDC_TEST_PRIVATE_KEY_PEM', None)
