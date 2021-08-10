// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  docManUrl: "http://localhost:5001",
  matomoUrl: "https://matomo-4c2ba9-test.apps.silver.devops.gov.bc.ca/",
  environment: "development",
  firstNationsLayerUrl: "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov",
  filesystemProviderUrl: "http://localhost:62870/file-api/AmazonS3Provider/",
  keycloak_resource: "mines-application-local",
  keycloak_clientId: "mines-application-local",
  keycloak_idpHint: "test",
  keycloak_url: "https://test.oidc.gov.bc.ca/auth",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
  docManUrl: "<DOCUMENT_MANAGER_URL>",
  matomoUrl: "<MATOMO_URL>",
  filesystemProviderUrl: "<FILESYSTEM_PROVIDER_URL>",
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
  role_edit_explosives_permits: "core_edit_explosives_permits",
  role_edit_template_conditions: "core_edit_template_conditions",
  role_view_admin_route: "core_view_admin_route",
  role_edit_reports: "core_edit_reports",
  role_edit_do: "core_edit_do",
  role_edit_variances: "core_edit_variances",
  role_close_permits: "core_close_permits",
  role_executive_view: "core_executive_view",
  role_minespace_proponent: "minespace-proponent",
  role_edit_securities: "core_edit_securities",
  role_edit_historical_amendments: "core_edit_historical_amendments",
};
