import os
# Auth Constants
TOKEN_HEADER = {"alg": "RS256", "typ": "JWT", "kid": os.environ.get('KEY_ID ', 'flask-jwt-oidc-test-client')}

BASE_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "preferred_username": "test-user",
    "client_roles": ["idir"]
}

FULL_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "preferred_username": "test-user",
    "email": "test-email",
    "given_name": "test-given-name",
    "client_roles": [
        "core_view_all", "core_edit_mines", "core_admin", "core_abandoned_mines",
        "core_close_permits", "core_edit_all", "core_edit_do", "core_edit_investigations",
        "core_edit_parties", "core_edit_permits", "core_edit_reports", "core_edit_securities",
        "core_edit_variances", "core_environmental_reports", "core_geospatial", "idir",
        "core_edit_submissions", "core_edit_explosives_permits",
        "core_edit_template_conditions", "mds_administrative_users", "core_edit_now_dates",
        "core_edit_emli_contacts", "core_edit_tsf", "core_edit_information_requirements_table",
        "core_edit_requirements"
    ]
}

VIEW_ONLY_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "preferred_username": "test-user",
    "email": "test-email",
    "client_roles": ["core_view_all", "idir"]
}

CREATE_ONLY_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "preferred_username": "test-user",
    "client_roles": ["core_edit_mines", "idir"]
}

ADMIN_ONLY_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "preferred_username": "test-user",
    "username": "test-user",
    "client_roles": ["core_admin", "idir"]
}

PROPONENT_ONLY_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "preferred_username": "test-proponent",
    "username": "test-proponent",
    "email": "test-proponent-email@minespace.ca",
    "client_roles": ["mds_minespace_proponents"],
    "bceid_username": "test-proponent"
}

NROS_VFCBC_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "preferred_username": "test-user",
    "username": "test-proponent",
    "email": "test-proponent-email@minespace.ca",
    "client_roles": ["core_edit_submissions"]
}

CORE_EDIT_PARTIES_AUTH_CLAIMS = {
    "iss": os.environ.get('JWT_OIDC_TEST_ISSUER ', 'test_issuer'),
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": os.environ.get('JWT_OIDC_TEST_AUDIENCE ', 'test_audience'),
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "preferred_username": "test-user",
    "username": "test-edit-parties",
    "email": "test-proponent-email@minespace.ca",
    "client_roles": ["core_edit_parties"]
}