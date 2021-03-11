(function(window) {
  window.env = window.env || {};
  // Environment variables
  window.env.environment = "development";
  window.env.basePath = "";
  window.env.assetPath = "/";

  window.env.keycloakUrl = "https://test.oidc.gov.bc.ca/auth";
  window.env.keycloakResource = "mines-application-local";
  window.env.keycloakClientId = "mines-application-local";
  window.env.keycloakIdpHint = "test";

  window.env.apiUrl = "http://localhost:5000";
  window.env.docManUrl = "http://localhost:5001";
  window.env.filesystemProviderUrl = "http://localhost:62870/file-api/AmazonS3Provider/";
  window.env.matomoUrl = "https://matomo-empr-mds-test.pathfinder.gov.bc.ca/";
  window.env.firstNationsLayerUrl = "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov";
})(this);
