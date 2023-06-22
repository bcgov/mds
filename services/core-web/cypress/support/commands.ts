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
  const baseUrl = 'http://localhost:8080/auth/realms/standard/protocol/openid-connect/auth';
  const clientId = 'mines-digital-services-mds-public-client-4414';
  const redirectUri = 'http://localhost:3000/home';
  const responseType = 'code';
  const challengeType = 'login';
  const codeChallengeMethod = 'S256';
  const codeChallenge = "Kc-nRFsPUU8pX16RwVPj_XkGndvukBihHfkvjUEE5a4";

  const keycloakUrl = `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&challenge_type=${challengeType}&code_challenge_method=${codeChallengeMethod}&code_challenge=${codeChallenge}`;

  cy.log(keycloakUrl);
  console.log(keycloakUrl);

  cy.intercept('GET', 'https://test.loginproxy.gov.bc.ca/auth**', (req) => {
    req.redirect(keycloakUrl);
  }).as('redirectInterceptor');

  const username = Cypress.env("test-user");
  const password = Cypress.env("test-pwd");
  const url = Cypress.env("url");
  cy.visit(url);

  // cy.url({ timeout: 10000 }).should("include", "test.loginproxy.gov.bc.ca");
  // cy.get("a#social-idir").click();
  // cy.url({ timeout: 10000 }).should("include", "logontest7.gov.bc.ca");

  // cy.get("#username").type(username);
  // cy.get("#password").type(password);

  // cy.get('[name="btnSubmit"]').click();
});
