// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  docManUrl: "http://localhost:5001",
  environment: "development",
  firstNationsLayerUrl: "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov",
  keycloak_resource: "mines-application-local",
  keycloak_clientId: "mines-application-local",
  keycloak_idpHint: "test",
  keycloak_url: "https://sso-test.pathfinder.gov.bc.ca/auth",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
  docManUrl: "<DOCUMENT_MANAGER_URL>",
  firstNationsLayerUrl: "<FN_LAYER_URL>",
  environment: "<ENV>",
};

export const KEYCLOAK = {
  realm: "mds",
  "ssl-required": "external",
  url: "<URL>",
  idpHint: "idir",
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

export const USER_ROLES = {
  role_view: "core_view_all",
  role_admin: "core_admin",
  role_contact_admin: "core_contact_admin",
  role_edit_mines: "core_edit_mines",
  role_edit_parties: "core_edit_parties",
  role_edit_permits: "core_edit_permits",
  role_edit_reports: "core_edit_reports",
  role_edit_do: "core_edit_do",
  role_edit_variances: "core_edit_variances",
  role_close_permits: "core_close_permits",
  role_executive_view: "core_executive_view",
  role_minespace_proponent: "minespace-proponent",
  role_edit_securities: "core_edit_securities",
};
