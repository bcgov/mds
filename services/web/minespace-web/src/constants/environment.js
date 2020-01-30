// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  docManUrl: "http://localhost:5001",
  keycloak_resource: "mines-application-local",
  keycloak_clientId: "minespace-local",
  keycloak_idpHint: "local",
  keycloak_url: "https://sso-test.pathfinder.gov.bc.ca/auth",
  siteminder_url: "https://logontest.gov.bc.ca",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
  docManUrl: "<DOCUMENT_MANAGER_URL>",
  environment: "development",
};

export const KEYCLOAK = {
  realm: "mds",
  "ssl-required": "external",
  resource: "<RESOURCE>",
  "public-client": true,
  "confidential-port": 0,
  clientId: "<CLIENT_ID>",
  idpHint: "local",
  loginURL: "<URL>",
  tokenURL: "<URL>",
  userInfoURL: "<URL>",
  keycloakLogoutURL: "<URL>",
  siteMinderLogoutURL: "<URL>",
};

const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;
export const BCEID_LOGIN_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=login`;
export const KEYCLOAK_LOGOUT_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=logout`;
export const SITEMINDER_LOGOUT_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=smlogout&retnow=1`;
