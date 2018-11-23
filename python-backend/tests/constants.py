# Test Constants
TEST_MINE_GUID = '4fc855aa-728a-48f2-a3df-85ce1336b01a'
TEST_MINE_GUID2 = '4fc855aa-728a-48f2-a3df-85ce1336b01b'

TEST_MINE_DETAIL_GUID = '94de18e5-5239-4df0-aa2d-b21961d4721e'
TEST_MINE_NAME = 'test_mine_name'
TEST_MINE_NO = 'BLAH000'

TEST_PARTY_PER_GUID_1 = 'df4939f0-04c9-49dc-bf04-2a3c3b8b0e24'
TEST_PARTY_PER_FIRST_NAME_1 = 'first_name'
TEST_PARTY_PER_PARTY_NAME_1 = 'test_surname'
TEST_PARTY_PER_EMAIL_1 = 'test1@test.com'
TEST_PARTY_PER_PHONE_1 = '123-456-7890'
TEST_PARTY_PER_PHONE_EXT_1 = '1234'

TEST_PARTY_PER_GUID_2 = 'df4939f0-04c9-49dc-bf04-2a3c3b8b0e22'
TEST_PARTY_PER_FIRST_NAME_2 = 'first_name2'
TEST_PARTY_PER_PARTY_NAME_2 = 'test_surname2'
TEST_PARTY_PER_EMAIL_2 = 'test2@test.com'
TEST_PARTY_PER_PHONE_2 = '123-456-7891'
TEST_PARTY_PER_PHONE_EXT_2 = '3215'

TEST_PARTY_PER_GUID_3 = 'df4939f0-04c9-49dc-bf04-2a3c3b8b0e23'
TEST_PARTY_PER_FIRST_NAME_3 = 'first_name3'
TEST_PARTY_PER_PARTY_NAME_3 = 'test_surname3'
TEST_PARTY_PER_EMAIL_3 = 'test3@test.com'
TEST_PARTY_PER_PHONE_3 = '123-456-7892'
TEST_PARTY_PER_PHONE_EXT_3 = '7895'

TEST_PARTY_ORG_GUID = 'edfdab51-cd4e-4575-9ebc-d120d14232ae'
TEST_PARTY_ORG_NAME = 'test_company'
TEST_PARTY_ORG_EMAIL = 'test_company@test.com'
TEST_PARTY_ORG_PHONE = '123-456-7832'
TEST_PARTY_ORG_EXT = '7855'

TEST_MANAGER_GUID = 'bf24fa6b-d6ad-4e20-8ce8-9bf92ad4d910'

TEST_TENURE_GUID = 'a9017fc1-1430-4054-8554-286122eca79a'
TEST_TENURE_ID = '1231231'

TEST_LOCATION_GUID = 'bd933449-c6a0-4b91-8b54-4f854d0315eb'
TEST_LAT_1 = '48.4284000'
TEST_LONG_1 = '123.3656000'

TEST_PERMIT_GUID_1 = 'd57604f4-c0de-4ec3-bf19-e82baaf14349'
TEST_PERMIT_NO_1 = 'TEST56789012'
TEST_PERMIT_STATUS_CODE_1 = 'T'
TEST_PERMIT_STATUS_CODE_NAME_1 = 'TEST'

TEST_PERMITTEE_GUID = '07bd6be1-5a27-4280-94a9-6358cc95d07d'

TEST_PERMIT_STATUS_CODES = ['O', 'C', 'T']
TEST_PARTY_TYPE = 'PER'
TEST_ORG_TYPE = 'ORG'

TEST_REGION_GUID = 'a0b98cb1-6e70-4c54-9395-1e8ccc867cd1'
TEST_REGION_CODES = ['SW','SC','NW','NE','SE']
TEST_REGION_CODE_DISPLAY_ORDER = [10,20,30,40,50]
TEST_REGION_CODE = 'NE'
TEST_REGION_DESCRIPTION= 'North East Region'

TEST_REQUIRED_REPORT_CATEGORY_TAILINGS_GUID = 'bd5ef43b-379a-41a0-aa00-c5b632e9c329'
TEST_REQUIRED_REPORT_CATEGORY_TAILINGS = 'MINE_TAILINGS'

TEST_REQUIRED_REPORT_CATEGORY_OTHER_GUID = 'bd5ef43b-379a-41a0-aa00-c5b632e9c32a'
TEST_REQUIRED_REPORT_CATEGORY_OTHER = 'MINE_OTHER'

TEST_REQUIRED_REPORT_GUID1 = '78cd68a9-f0ff-4fac-b2b7-10efe67e37b9'
TEST_REQUIRED_REPORT_NAME1 = 'Required Report for Tailings Facility 1'

TEST_REQUIRED_REPORT_GUID2 = '78cd68a9-f0ff-4fac-b2b7-10efe67e37ba'
TEST_REQUIRED_REPORT_NAME2 = 'Required Report for Tailings Facility 2'

TEST_REQUIRED_REPORT_GUID3 = '78cd68a9-f0ff-4fac-b2b7-10efe67e37bb'
TEST_REQUIRED_REPORT_NAME3 = 'Required Report for OTHER'

TEST_EXPECTED_DOCUMENT_GUID1 = 'f6c98d68-e565-41f3-9cea-d3cb4542c813'
TEST_EXPECTED_DOCUMENT_NAME1 = 'Expected Document 1'

TEST_EXPECTED_DOCUMENT_GUID2 = 'f6c98d68-e565-41f3-9cea-d3cb4542c814'
TEST_EXPECTED_DOCUMENT_NAME2 = 'Expected Document 2'

TEST_TAILINGS_STORAGE_FACILITY_GUID1 = '6e7348fd-5aaf-4910-a2e2-c36d17ff6903'
TEST_TAILINGS_STORAGE_FACILITY_NAME1 = 'Tailings Facility 1'

TEST_TAILINGS_STORAGE_FACILITY_GUID2 = '6e7348fd-5aaf-4910-a2e2-c36d17ff6904'
TEST_TAILINGS_STORAGE_FACILITY_NAME2 = 'Tailings Facility 2'

DUMMY_USER_KWARGS = {'create_user': 'DummyUser', 'update_user': 'DummyUser'}

# Auth Constants
TOKEN_HEADER = {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "flask-jwt-oidc-test-client"
}

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
        "roles": [
            "idir"
        ]
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
        "roles": [
            "mds-mine-view",
            "mds-mine-create",
            "idir"
        ]
    }
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
    "realm_access": {
        "roles": [
            "mds-mine-view",
            "idir"
        ]
    }
}
