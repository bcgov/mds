from app.nris.utils.access_decorators import NRIS_VIEW  #, NRIS_CREATE, NRIS_CREATE, MINESPACE_PROPONENT

# Auth Constants
TOKEN_HEADER = {"alg": "RS256", "typ": "JWT", "kid": "flask-jwt-oidc-test-client"}

BASE_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "realm_access": {
        "roles": ["idir"]
    }
}

FULL_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "preferred_username": "test-user",
    "email": "test-email",
    "given_name": "test-given-name",
    "realm_access": {
        "roles": [NRIS_VIEW, "idir"]
        #"roles": [NRIS_VIEW, NRIS_CREATE, NRIS_ADMIN, "idir"]
    }
}

NRIS_VIEW_ONLY_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "email": "test-email",
    "realm_access": {
        "roles": [NRIS_VIEW, "idir"]
    }
}

# CREATE_ONLY_AUTH_CLAIMS = {
#     "iss": "test_issuer",
#     "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
#     "aud": "test_audience",
#     "exp": 21531718745,
#     "iat": 1531718745,
#     "jti": "flask-jwt-oidc-test-support",
#     "typ": "Bearer",
#     "username": "test-user",
#     "realm_access": {
#         "roles": [NRIS_CREATE, "idir"]
#     }
# }

# ADMIN_ONLY_AUTH_CLAIMS = {
#     "iss": "test_issuer",
#     "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
#     "aud": "test_audience",
#     "exp": 21531718745,
#     "iat": 1531718745,
#     "jti": "flask-jwt-oidc-test-support",
#     "typ": "Bearer",
#     "username": "test-user",
#     "realm_access": {
#         "roles": [NRIS_ADMIN, "idir"]
#     }
# }

# PROPONENT_ONLY_AUTH_CLAIMS = {
#     "iss": "test_issuer",
#     "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
#     "aud": "test_audience",
#     "exp": 21531718745,
#     "iat": 1531718745,
#     "jti": "flask-jwt-oidc-test-support",
#     "typ": "Bearer",
#     "username": "test-proponent",
#     "email": "test-proponent-email@minespace.ca",
#     "realm_access": {
#         "roles": [MINESPACE_PROPONENT]
#     }
# }
