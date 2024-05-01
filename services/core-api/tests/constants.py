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
    "preferred_username": "test-user",
    "client_roles": ["idir"]
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
    "client_roles": ["core_view_all", "idir"]
}

CREATE_ONLY_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "username": "test-user",
    "preferred_username": "test-user",
    "client_roles": ["core_edit_mines", "idir"]
}

ADMIN_ONLY_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "preferred_username": "test-user",
    "username": "test-user",
    "client_roles": ["core_admin", "idir"]
}

PROPONENT_ONLY_AUTH_CLAIMS = {
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
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
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
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
    "iss": "test_issuer",
    "sub": "43e6a245-0bf7-4ccf-9bd0-e7fb85fd18cc",
    "aud": "test_audience",
    "exp": 21531718745,
    "iat": 1531718745,
    "jti": "flask-jwt-oidc-test-support",
    "typ": "Bearer",
    "preferred_username": "test-user",
    "username": "test-edit-parties",
    "email": "test-proponent-email@minespace.ca",
    "client_roles": ["core_edit_parties"]
}

CORE_EDIT_CODE = {
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
    "client_roles": [
        "core_edit_code"
    ]
}

# Major Projects Summary constants

MAJOR_PROJECTS_SUMMARY_MOCK_DATA = {
    'facility_coords_source': "GPS",
    'facility_desc': "description",
    'facility_latitude': "50.0000000",
    'facility_longitude': "-115.0000000",
    'facility_type': "test type",
    'zoning': True,
    'is_agent': False,
    'is_legal_land_owner': True,
    'is_crown_land_federal_or_provincial': None,
    'is_landowner_aware_of_discharge_application': True,
    'has_landowner_received_copy_of_application': False,
    'legal_land_owner_name': "some name",
    'legal_land_owner_contact_number': "123-123-1234",
    'legal_land_owner_email_address': "test@gov.bc.ca",
    'confirmation_of_submission': True,
    'ams_terms_agreed': True,
    'contacts': [
        {
            "email": "test@gov.bc.ca",
            "phone_number": "123-123-1234",
            "is_primary": True,
            "first_name": "test name",
            "last_name": "test name",
            "address": {
                "suite_no": "123",
                "address_line_1": "some street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            }
        },
    ],
    'applicant': {
        "party_type_code": "ORG",
        "phone_no": "123-123-1234",
        "email": "test@gov.bc.ca",
        "party_name": "test name",
        "address": [
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            },
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            },
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            }
        ],
    },
    'agent': {
        "party_type_code": "PER",
        "phone_no": "123-123-1234",
        "email": "test@gov.bc.ca",
        "party_name": "test name",
        "first_name": "test name",
        "address": {
            "suite_no": "",
            "address_line_1": None,
            "city": "Vancouver",
            "sub_division_code": "BC",
            "post_code": None,
            "address_type_code": "CAN"
        },
    },
    'facility_operator': {
        "party_type_code": "PER",
        "phone_no": "123-123-1234",
        "email": "test@govb.bc.ca",
        "party_name": "test name",
        "first_name": "test",
        "address": {
            "suite_no": "123",
            "address_line_1": "some address",
            "city": "vancouver",
            "sub_division_code": "BC",
            "post_code": "V5S4W2",
            "address_type_code": "CAN"
        },
    },
    'ams_authorizations': {
    "amendments": [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
            "project_summary_authorization_type": "AIR_EMISSIONS_DISCHARGE_PERMIT",
            "existing_permits_authorizations": [
                "1234"
            ],
            "amendment_changes": [
                "ILT",
                "IGT"
            ],
            "amendment_severity": "SIG",
            "is_contaminated": False,
            "authorization_description": "test descript",
            "exemption_requested": False,
        }
    ],
    "new": []
    },
    'authorizations': [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
            "project_summary_authorization_type": "AIR_EMISSIONS_DISCHARGE_PERMIT",
            "existing_permits_authorizations": [
                "1234"
            ],
            "amendment_changes": [
                "ILT",
                "IGT"
            ],
            "amendment_severity": "SIG",
            "is_contaminated": False,
            "authorization_description": "description",
            "exemption_requested": False,
        }
    ],
}
