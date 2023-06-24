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

  // cy.intercept(
  //   "POST",
  //   "http://localhost:8080/auth/realms/standard/protocol/openid-connect/token",
  //   (req) => {
  //     req.reply({
  //       statusCode: 200,
  //       body: {
  //         access_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZsYXNrLWp3dC1vaWRjLXRlc3QtY2xpZW50IiwidHlwIjoiSldUIn0.eyJpc3MiOiJ0ZXN0X2lzc3VlciIsInN1YiI6IjQzZTZhMjQ1LTBiZjctNGNjZi05YmQwLWU3ZmI4NWZkMThjYyIsImF1ZCI6InRlc3RfYXVkaWVuY2UiLCJleHAiOjIxNTMxNzE4NzQ1LCJpYXQiOjE1MzE3MTg3NDUsImp0aSI6ImZsYXNrLWp3dC1vaWRjLXRlc3Qtc3VwcG9ydCIsInR5cCI6IkJlYXJlciIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3QtdXNlciIsInVzZXJuYW1lIjoidGVzdC1lZGl0LXBhcnRpZXMiLCJlbWFpbCI6InRlc3QtcHJvcG9uZW50LWVtYWlsQG1pbmVzcGFjZS5jYSIsImNsaWVudF9yb2xlcyI6WyJjb3JlX2VkaXRfcGFydGllcyJdfQ.uO03Pm6D-E9g7mE_kvCANtdJ2pzsudjvwRNKOqzmFPFTR2MphO9pCHBOYLa0xh9P8KI-sw2GVYB9kz4-RLyrWAd2YwWuCAFJhhHFKZeFWWnuX-_KgR1KeaQeQZJkiOYuiwYdlVzkZbodQdx3bh2Q8ujSUohlQ3AR8utiKy0hy4g",
  //         expires_in: 18000,
  //         refresh_expires_in: 18000,
  //         refresh_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZsYXNrLWp3dC1vaWRjLXRlc3QtY2xpZW50IiwidHlwIjoiSldUIn0.eyJpc3MiOiJ0ZXN0X2lzc3VlciIsInN1YiI6IjQzZTZhMjQ1LTBiZjctNGNjZi05YmQwLWU3ZmI4NWZkMThjYyIsImF1ZCI6InRlc3RfYXVkaWVuY2UiLCJleHAiOjIxNTMxNzE4NzQ1LCJpYXQiOjE1MzE3MTg3NDUsImp0aSI6ImZsYXNrLWp3dC1vaWRjLXRlc3Qtc3VwcG9ydCIsInR5cCI6IkJlYXJlciIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3QtdXNlciIsInVzZXJuYW1lIjoidGVzdC1lZGl0LXBhcnRpZXMiLCJlbWFpbCI6InRlc3QtcHJvcG9uZW50LWVtYWlsQG1pbmVzcGFjZS5jYSIsImNsaWVudF9yb2xlcyI6WyJjb3JlX2VkaXRfcGFydGllcyJdfQ.uO03Pm6D-E9g7mE_kvCANtdJ2pzsudjvwRNKOqzmFPFTR2MphO9pCHBOYLa0xh9P8KI-sw2GVYB9kz4-RLyrWAd2YwWuCAFJhhHFKZeFWWnuX-_KgR1KeaQeQZJkiOYuiwYdlVzkZbodQdx3bh2Q8ujSUohlQ3AR8utiKy0hy4g",
  //         token_type: "Bearer",
  //         id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZsYXNrLWp3dC1vaWRjLXRlc3QtY2xpZW50IiwidHlwIjoiSldUIn0.eyJpc3MiOiJ0ZXN0X2lzc3VlciIsInN1YiI6IjQzZTZhMjQ1LTBiZjctNGNjZi05YmQwLWU3ZmI4NWZkMThjYyIsImF1ZCI6InRlc3RfYXVkaWVuY2UiLCJleHAiOjIxNTMxNzE4NzQ1LCJpYXQiOjE1MzE3MTg3NDUsImp0aSI6ImZsYXNrLWp3dC1vaWRjLXRlc3Qtc3VwcG9ydCIsInR5cCI6IkJlYXJlciIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3QtdXNlciIsInVzZXJuYW1lIjoidGVzdC1lZGl0LXBhcnRpZXMiLCJlbWFpbCI6InRlc3QtcHJvcG9uZW50LWVtYWlsQG1pbmVzcGFjZS5jYSIsImNsaWVudF9yb2xlcyI6WyJjb3JlX2VkaXRfcGFydGllcyJdfQ.uO03Pm6D-E9g7mE_kvCANtdJ2pzsudjvwRNKOqzmFPFTR2MphO9pCHBOYLa0xh9P8KI-sw2GVYB9kz4-RLyrWAd2YwWuCAFJhhHFKZeFWWnuX-_KgR1KeaQeQZJkiOYuiwYdlVzkZbodQdx3bh2Q8ujSUohlQ3AR8utiKy0hy4g",
  //         "not-before-policy": 0,
  //         session_state: "f3452404-6dcf-4f0c-8ae2-26768db40cc3",
  //         scope: "openid idir profile email bceidboth",
  //       },
  //       headers: {
  //         "content-type": "application/json",
  //       },
  //     });
  //   }
  // );
});
