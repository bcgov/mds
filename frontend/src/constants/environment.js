// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
    "apiUrl": "http://localhost:5000",
    "keycloak_resource": "frontend-local-sam",
    "keycloak_clientId": "frontend-local-sam",
    "keycloak_url": "https://sso-test.pathfinder.gov.bc.ca/auth",
    "keycloak_role_admin": "mds-mine-admin",
    "keycloak_role_create": "mds-mine-create",
    "keycloak_role_view": "mds-mine-view"
};

export const ENVIRONMENT = {
    "apiUrl": "<API_URL>"
};

export const KEYCLOAK = {
  "realm": "mds",
  "url": "<URL>",
  "ssl-required": "external",
  "resource": "<RESOURCE>",
  "public-client": true,
  "confidential-port": 0,
  "clientId": "<CLIENT_ID>"
}

export const USER_ROLES = {
  "role_admin": "",
  "role_create": "",
  "role_view": ""
}