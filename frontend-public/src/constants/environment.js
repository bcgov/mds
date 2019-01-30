// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  keycloak_resource: "mines-application-local",
  keycloak_clientId: "mines-application-local",
  keycloak_idpHint: "test",
  keycloak_url: "https://sso-test.pathfinder.gov.bc.ca",
  siteminder_url: "https://logontest.gov.bc.ca",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
};

export const KEYCLOAK = {
  realm: "mds",
  "ssl-required": "external",
  resource: "<RESOURCE>",
  "public-client": true,
  "confidential-port": 0,
  clientId: "<CLIENT_ID>",
  loginURL: "<URL>",
  tokenURL: "<URL>",
  userInfoURL: "<URL>",
  keycloakLogoutURL: "<URL>",
  siteMinderLogoutURL: "<URL>",
};

export const BCEID_LOGIN_REDIRECT_URI = `${window.location.origin}/return-page?type=login`;
export const BCEID_HINT = "&kc_idp_hint=bceid";
export const KEYCLOAK_LOGOUT_REDIRECT_URI = `${window.location.origin}/return-page?type=logout`;
export const SITEMINDER_LOGOUT_REDIRECT_URI = `${
  window.location.origin
}/return-page?type=smlogout&retnow=1`;
