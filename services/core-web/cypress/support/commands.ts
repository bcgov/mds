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
  const url = Cypress.env("url");
  const environmentUrl = Cypress.env("environmentUrl");

  const response = {
    backend: Cypress.env("backend"),
    apiUrl: Cypress.env("apiUrl"),
    docManUrl: Cypress.env("docManUrl"),
    matomoUrl: Cypress.env("matomoUrl"),
    filesystemProviderUrl: Cypress.env("filesystemProviderUrl"),
    keycloak_clientId: Cypress.env("keycloakClientId"),
    keycloak_resource: Cypress.env("keycloakResource"),
    keycloak_url: Cypress.env("keyCloakUrl"),
    keycloak_idpHint: Cypress.env("keyCloakIDPHint"),
    environment: Cypress.env("environment"),
  };

  cy.intercept("GET", environmentUrl, (req) => {
    req.reply(response);
  });
  cy.visit(url);
  cy.url({ timeout: 10000 }).should("include", "localhost:8080");
  cy.get("#username").type("cypress");
  cy.get("#password").type("cypress");
  cy.get("#kc-login").click();

  cy.intercept(
    "POST",
    "http://localhost:8080/auth/realms/standard/protocol/openid-connect/token",
    (req) => {
      req.reply({
        statusCode: 200,
        body: {
          access_token: "abcde123",
          expires_in: 300,
          refresh_expires_in: 1800,
          refresh_token: "abcde123",
          token_type: "Bearer",
          id_token: "abcde123",
          "not-before-policy": 0,
          session_state: "f3452404-6dcf-4f0c-8ae2-26768db40cc3",
          scope: "openid idir profile email bceidboth",
        },
        headers: {
          "content-type": "application/json",
        },
      });
    }
  );
});
