// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// eslint-disable-next-line consistent-return

Cypress.Commands.add("login", () => {
  const url = Cypress.env("CYPRESS_TEST_URL");
  const environmentUrl = `${Cypress.env("CYPRESS_TEST_URL")}/env`;

  const response = {
    backend: Cypress.env("CYPRESS_BACKEND"),
    apiUrl: Cypress.env("CYPRESS_API_URL"),
    docManUrl: Cypress.env("CYPRESS_DOC_MAN_URL"),
    matomoUrl: Cypress.env("MATOMO_URL"),
    filesystemProviderUrl: Cypress.env("FILESYSTEM_PROVIDER_URL"),
    keycloak_clientId: Cypress.env("KEYCLOAK_CLIENT_ID"),
    keycloak_resource: Cypress.env("KEYCLOAK_RESOURCE"),
    keycloak_url: Cypress.env("CYPRESS_KEYCLOAK_URL"),
    keycloak_idpHint: Cypress.env("KEYCLOAK_IDP_HINT"),
    environment: Cypress.env("CYPRESS_ENVIRONMENT"),
  };

  cy.intercept("GET", environmentUrl, (req) => {
    req.reply(response);
  });
  cy.visit(url);
  cy.url({ timeout: 10000 }).should("include", "localhost:8080");
  cy.get("#username").type("cypress");
  cy.get("#password").type("cypress");
  cy.get("#kc-login").click();
});
