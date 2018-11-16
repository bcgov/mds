// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
    "apiUrl": "http://localhost:5000",
    "keycloak_resource": "mines-application-local",
    "keycloak_clientId": "mines-application-local",
    "keycloak_idpHint": "test",
    "keycloak_url": "http://localhost:8080/auth",
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
  "idpHint": "idir",
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