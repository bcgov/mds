(function(window) {
  window.env = window.env || {};
  // Environment variables
  window.env = window.env || {};
  // Environment variables
  window.env.environment = "${ENVIRONMENT}" || "development";
  window.env.basePath = "${BASE_PATH}";
  window.env.assetPath = "${ASSET_PATH}" || "/";

  window.env.keycloakUrl = "${KEYCLOAK_URL}" || "https://test.oidc.gov.bc.ca/auth";
  window.env.keycloakResource = "${KEYCLOAK_RESOURCE}" || "mines-application-local";
  window.env.keycloakClientId = "${KEYCLOAK_CLIENT_ID}" || "mines-application-local";
  window.env.keycloakIdpHint = "${KEYCLOAK_IDP_HINT}" || "test";

  window.env.apiUrl = "${API_URL}" || "http://localhost:5000";
  window.env.docManUrl = "${DOCUMENT_MANAGER_URL}" || "http://localhost:5001";
  window.env.filesystemProviderUrl =
    "${FILESYSTEM_PROVIDER_URL}" || "http://localhost:62870/file-api/AmazonS3Provider/";
  window.env.matomoUrl = "${MATOMO_URL}" || "https://matomo-empr-mds-test.pathfinder.gov.bc.ca/";
  window.env.firstNationsLayerUrl =
    "${FN_LAYER_URL}" || "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov";
})(this);
