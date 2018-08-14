export const DEFAULT_ENVIRONMENT = {
    apiUrl: 'http://localhost:5000',
    keycloak_resource: 'mines-application-local',
    keycloak_clientId: 'mines-application-local'
};

export const ENVIRONMENT = {
    apiUrl: '<API_URL>'
};

export const KEYCLOAK = {
  "realm": "mds",
  "url": "https://sso-test.pathfinder.gov.bc.ca/auth",
  "ssl-required": "external",
  "resource": '<RESOURCE>',
  "public-client": true,
  "confidential-port": 0,
  "clientId": '<CLIENT_ID>'
}