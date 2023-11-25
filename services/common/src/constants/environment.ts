// environment config variables for test/dev/prod
export const FIRST_NATIONS_LAYER_URL = "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov";

export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  docManUrl: "http://localhost:5001",
  matomoUrl: "https://matomo-4c2ba9-test.apps.silver.devops.gov.bc.ca/",
  environment: "development",
  filesystemProviderUrl: "http://localhost:62870/file-api/AmazonS3Provider/",
  keycloak_resource: "mines-digital-services-mds-public-client-4414",
  keycloak_clientId: "mines-digital-services-mds-public-client-4414",
  keycloak_idpHint: "test",
  keycloak_url: "https://test.loginproxy.gov.bc.ca/auth",
  flagsmithKey: "4Eu9eEMDmWVEHKDaKoeWY7",
  flagsmithUrl: "https://mds-flags-dev.apps.silver.devops.gov.bc.ca/api/v1/",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
  docManUrl: "<DOCUMENT_MANAGER_URL>",
  matomoUrl: "<MATOMO_URL>",
  filesystemProviderUrl: "<FILESYSTEM_PROVIDER_URL>",
  environment: "<ENV>",
  flagsmithKey: "<FLAGSMITH_KEY>",
  flagsmithUrl: "<FLAGSMITH_URL>",
  _loaded: false,
};

export const KEYCLOAK = {
  realm: "standard",
  "ssl-required": "external",
  "public-client": true,
  "confidential-port": 0,
  pkceMethod: "S256",

  idir_idpHint: "idir",
  bceid_idpHint: "bceidboth",
  vcauthn_idpHint: "ms-verifiable-credential",

  url: "<URL>",
  clientId: "<CLIENT_ID>",
  resource: "<RESOURCE>",

  keycloakLogoutURL: "<URL>",
  siteMinderLogoutURL: "<URL>",
  loginURL: "<URL>",
  tokenURL: "<URL>",
  userInfoURL: "<URL>",
};

export function setupEnvironment(
  apiUrl,
  docManUrl,
  filesystemProviderUrl,
  matomoUrl,
  environment,
  flagsmithKey,
  flagsmithUrl
) {
  if (!apiUrl) {
    throw new Error("apiUrl Is Mandatory");
  }

  if (!docManUrl) {
    throw new Error("docManUrl Is Mandatory");
  }

  if (!filesystemProviderUrl) {
    throw new Error("filesystemProviderUrl Is Mandatory");
  }

  if (!matomoUrl) {
    throw new Error("matomoUrl Is Mandatory");
  }

  if (!environment) {
    throw new Error("environment Is Mandatory");
  }
  if (!flagsmithKey) {
    throw new Error("flagsmithKey Is Mandatory");
  }
  if (!flagsmithUrl) {
    throw new Error("flagsmithUrl Is Mandatory");
  }

  ENVIRONMENT.apiUrl = apiUrl;
  ENVIRONMENT.docManUrl = docManUrl;
  ENVIRONMENT.filesystemProviderUrl = filesystemProviderUrl;
  ENVIRONMENT.matomoUrl = matomoUrl;
  ENVIRONMENT.environment = environment || "development";
  ENVIRONMENT.flagsmithKey = flagsmithKey;
  ENVIRONMENT.flagsmithUrl = flagsmithUrl;

  ENVIRONMENT._loaded = true;
}

export function setupKeycloak(
  clientId,
  resource,
  url,
  idirHint,
  bceidHint,
  vcauthnHint,
  vcauthnPresReqConfId,
  siteMinderURL
) {
  if (!clientId) {
    throw new Error("clientId Is Mandatory");
  }

  if (!resource) {
    throw new Error("resource Is Mandatory");
  }

  if (!url) {
    throw new Error("url Is Mandatory");
  }

  if (!idirHint) {
    throw new Error("idirHint Is Mandatory");
  }

  if (!bceidHint) {
    throw new Error("bceidHint Is Mandatory");
  }

  if (!vcauthnHint) {
    throw new Error("vcauthnHint Is Mandatory");
  }

  if (!siteMinderURL) {
    throw new Error("siteMinderURL Is Mandatory");
  }

  KEYCLOAK.clientId = clientId;
  KEYCLOAK.resource = resource;
  KEYCLOAK.url = url;
  KEYCLOAK.idir_idpHint = idirHint;
  KEYCLOAK.bceid_idpHint = bceidHint;
  KEYCLOAK.vcauthn_idpHint = vcauthnHint;

  KEYCLOAK.keycloakLogoutURL = `${url}/realms/standard/protocol/openid-connect/logout?redirect_uri=`;
  KEYCLOAK.loginURL = `${url}/realms/standard/protocol/openid-connect/auth?response_type=code&pres_req_conf_id=${vcauthnPresReqConfId}&client_id=${clientId}&redirect_uri=`;
  KEYCLOAK.tokenURL = `${url}/realms/standard/protocol/openid-connect/token`;
  KEYCLOAK.userInfoURL = `${url}/realms/standard/protocol/openid-connect/userinfo`;

  KEYCLOAK.siteMinderLogoutURL = `${siteMinderURL}/clp-cgi/logoff.cgi?returl=`;
}

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
  role_minespace_proponent: "mds_minespace_proponents",
  role_edit_securities: "core_edit_securities",
  role_edit_historical_amendments: "core_edit_historical_amendments",
  role_mds_administrative_users: "mds_administrative_users",
  role_edit_now_dates: "core_edit_now_dates",
  role_edit_emli_contacts: "core_edit_emli_contacts",
  role_edit_project_summaries: "core_edit_project_summaries",
  role_edit_project_decision_package: "core_edit_project_decision_packages",
  role_edit_major_mine_applications: "core_edit_major_mine_applications",
  role_edit_information_requirements_table: "core_edit_information_requirements_table",
  role_edit_incidents: "core_edit_incidents",
  role_edit_tsf: "core_edit_tsf",
  role_abandoned_mines: "core_abandoned_mines",
};