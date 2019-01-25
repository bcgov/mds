import { KEYCLOAK, DEFAULT_ENVIRONMENT } from "./environment";
import { RETURN_PAGE_TYPE } from "./strings";

// Network URL's
export const MINE = "/mines";
export const MINE_NAME_LIST = "/mines/names";

export const DOCUMENT_STATUS = "/documents/expected/status";
export const MINE_DOCUMENTS = "/documents/mines";
export const UPLOAD_MINE_EXPECTED_DOCUMENT_FILE = (expectedDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document`;
export const EXPECTED_DOCUMENT = "/documents/expected";
export const REMOVE_MINE_EXPECTED_DOCUMENT = (expectedDocumentGuid, mineDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document/${mineDocumentGuid}`;

export const DOCUMENT_MANAGER_FILE_GET_URL = "/document-manager";

// Keycloak/SiteMinder URLs
export const SSO_CLIENT_ID = "mines-application-local";
export const SITEMINDER_BASE_URL = "https://logontest.gov.bc.ca";
export const LOCATION_RETURN = `${window.location.origin}/return-page?type=`;
export const OPEN_ID_CONNECT_URL = `/auth/realms/${KEYCLOAK.realm}/protocol/openid-connect`;
export const GET_TOKEN_FROM_SSO = `${DEFAULT_ENVIRONMENT.keycloak_url}${OPEN_ID_CONNECT_URL}/token`;
export const GET_USER_INFO_FROM_SSO = `${
  DEFAULT_ENVIRONMENT.keycloak_url
}${OPEN_ID_CONNECT_URL}/userinfo`;
export const SSO_BASE_AUTH_ENDPOINT = `${DEFAULT_ENVIRONMENT.keycloak_url}${OPEN_ID_CONNECT_URL}`;
export const SSO_LOGIN_REDIRECT_URI = `${LOCATION_RETURN}${RETURN_PAGE_TYPE.LOGIN}`;
export const SSO_LOGIN_ENDPOINT = `${
  DEFAULT_ENVIRONMENT.keycloak_url
}${OPEN_ID_CONNECT_URL}/auth?response_type=code&client_id=${SSO_CLIENT_ID}&redirect_uri=${SSO_LOGIN_REDIRECT_URI}`;
export const SSO_BCEID_LOGIN_ENDPOINT = `${SSO_LOGIN_ENDPOINT}&kc_idp_hint=bceid`;
export const SSO_LOGOUT_REDIRECT_URI = `${LOCATION_RETURN}${RETURN_PAGE_TYPE.LOGOUT}`;
export const SSO_LOGOUT_ENDPOINT = `${SSO_BASE_AUTH_ENDPOINT}/logout?redirect_uri=${SSO_LOGOUT_REDIRECT_URI}`;
export const SITEMINDER_LOGOUT_REDIRECT_URI = `${LOCATION_RETURN}${
  RETURN_PAGE_TYPE.SITEMINDER_LOGOUT
}`;
export const SITEMINDER_LOGOUT_ENDPOINT = `${SITEMINDER_BASE_URL}/clp-cgi/logoff.cgi?returl=${SITEMINDER_LOGOUT_REDIRECT_URI}&retnow=1`;
