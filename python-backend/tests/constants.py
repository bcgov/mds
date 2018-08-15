import uuid
import copy
# Test Constants
TEST_MINE_NAME = 'test_mine_name'
TEST_MINE_NO = 'BLAH000'
TEST_FIRST_NAME = 'first_name'
TEST_SURNAME = 'test_surname'
TEST_FIRST_NAME_2 = 'first_name2'
TEST_SURNAME_2 = 'test_surname2'
TEST_FIRST_NAME_3 = 'first_name3'
TEST_SURNAME_3 = 'test_surname3'
TEST_MINE_GUID = '4fc855aa-728a-48f2-a3df-85ce1336b01a'
TEST_PERSON_GUID = 'df4939f0-04c9-49dc-bf04-2a3c3b8b0e24'
TEST_PERSON_2_GUID = 'df4939f0-04c9-49dc-bf04-2a3c3b8b0e22'
TEST_PERSON_3_GUID = 'df4939f0-04c9-49dc-bf04-2a3c3b8b0e23'
TEST_MANAGER_GUID = 'bf24fa6b-d6ad-4e20-8ce8-9bf92ad4d910'
TEST_TENURE_ID = '1231231'
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
                "roles": []
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
            "realm_access": {
                "roles": [
                    "mds-mine-view",
                    "mds-mine-create",
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
                ]
            }
         }
