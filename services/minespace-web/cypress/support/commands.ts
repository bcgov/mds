Cypress.Commands.add("login", () => {
  const url = Cypress.env("CYPRESS_MINESPACE_WEB_TEST_URL");
  const environmentUrl = `${url}/env`;
  const commonVariables = "bceid";

  const response = {
    backend: Cypress.env("CYPRESS_BACKEND"),
    apiUrl: Cypress.env("CYPRESS_API_URL"),
    docManUrl: Cypress.env("CYPRESS_DOC_MAN_URL"),
    matomoUrl: Cypress.env("CYPRESS_MATOMO_URL"),
    filesystemProviderUrl: Cypress.env("CYPRESS_FILE_SYSTEM_PROVIDER_URL"),
    flagsmithUrl: Cypress.env("CYPRESS_FLAGSMITH_URL"),
    errorNotifyRecipients: Cypress.env("ERROR_NOTIFY_RECIPIENTS"),
    flagsmithKey: Cypress.env("CYPRESS_FLAGSMITH_KEY"),
    keycloak_clientId: Cypress.env("CYPRESS_KEYCLOAK_CLIENT_ID"),
    keycloak_resource: Cypress.env("CYPRESS_KEYCLOAK_RESOURCE"),
    keycloak_url: Cypress.env("CYPRESS_KEYCLOAK_URL"),
    keycloak_idir_idpHint: commonVariables,
    keycloak_bceid_idpHint: commonVariables,
    keycloak_vcauthn_idpHint: commonVariables,
    siteminder_url: Cypress.env("CYPRESS_KEYCLOAK_URL"),
    environment: Cypress.env("CYPRESS_ENVIRONMENT"),
    vcauthn_pres_req_conf_id: "minespace-access-0.1-dev",
  };

  cy.intercept("GET", environmentUrl, (req) => {
    req.reply(response);
  });

  cy.visit(url);
  cy.contains("Log in with BCeID").click();
  cy.get("#username").type(Cypress.env("CYPRESS_TEST_USER"));
  cy.get("#password").type(Cypress.env("CYPRESS_TEST_PASSWORD"));
  cy.get("#kc-login").click();
});
