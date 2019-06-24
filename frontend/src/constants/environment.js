// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  environment: "development",
  mapPortalId: "e926583cd0114cd19ebc591f344e30dc",
  keycloak_resource: "mines-application-local",
  keycloak_clientId: "mines-application-local",
  keycloak_idpHint: "test",
  keycloak_url: "https://sso-test.pathfinder.gov.bc.ca/auth",
  keycloak_role_admin: "core_admin",
  keycloak_role_create: "core_edit_mine",
  keycloak_role_view: "core_view_all",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
  mapPortalId: "<ARCGIS_PORTAL_MAP_ID>",
  environment: "<ENV>",
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

export const USER_ROLES = {
  role_admin: "core_admin",
  role_create: "core_edit_mine",
  role_view: "core_view_all",
};
