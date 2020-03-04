import * as COMMON_ENV from "@common/constants/environment";
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

export const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;

export const BCEID_LOGIN_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=login`;
export const KEYCLOAK_LOGOUT_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=logout`;
export const SITEMINDER_LOGOUT_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=smlogout&retnow=1`;
