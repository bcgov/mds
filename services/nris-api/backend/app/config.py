import os

from dotenv import load_dotenv, find_dotenv


class Config(object):
    # Environment config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    BASE_PATH = os.environ.get('BASE_PATH', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'user')
    DB_PASS = os.environ.get('DB_PASS', 'pass')
    DB_PORT = os.environ.get('DB_PORT', 5432)
    DB_NAME = os.environ.get('DB_NAME', 'db_name')
    DB_URL = f"postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    ENVIRONMENT_NAME = os.environ.get('ENVIRONMENT_NAME', 'dev')

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
        return (jwt_dict['client_roles'])


class TestConfig(Config):
    TESTING = os.environ.get('TESTING', True)

    DB_NAME = os.environ.get('DB_NAME_TEST', 'db_name_test')
    DB_URL = f"postgres://{Config.DB_USER}:{Config.DB_PASS}@{Config.DB_HOST}:{Config.DB_PORT}/{DB_NAME}"
    SQLALCHEMY_DATABASE_URI = DB_URL

    NRIS_DB_USER = os.environ.get('NRIS_DB_USER', 'localhost')
    NRIS_DB_PASSWORD = os.environ.get('NRIS_DB_PASSWORD', 'localhost')
    NRIS_DB_PORT = os.environ.get('NRIS_DB_PORT', 'localhost')
    NRIS_DB_SERVICENAME = os.environ.get('NRIS_DB_SERVICENAME', 'localhost')
    NRIS_DB_HOSTNAME = os.environ.get('NRIS_DB_HOSTNAME', 'localhost')
    NRIS_SERVER_CERT_DN = os.environ.get('NRIS_SERVER_CERT_DN', 'localhost')

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
