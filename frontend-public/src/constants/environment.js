// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  keycloak_resource: "minespace-local",
  keycloak_clientId: "minespace-local",
  keycloak_idpHint: "test",
  keycloak_url: "https://sso-test.pathfinder.gov.bc.ca/auth",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
};

export const KEYCLOAK = {
  realm: "mds",
  url: "<URL>",
  idpHint: "idir",
  "ssl-required": "external",
  resource: "<RESOURCE>",
  "public-client": true,
  "confidential-port": 0,
  clientId: "<CLIENT_ID>",
};
