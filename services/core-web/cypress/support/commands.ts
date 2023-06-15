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
  const username = Cypress.env("test-user");
  const password = Cypress.env("test-pwd");
  const url = Cypress.env("url");
  cy.visit(url);

  cy.url({ timeout: 10000 }).should("include", "test.loginproxy.gov.bc.ca");
  cy.get("a#social-idir").click();
  cy.url({ timeout: 10000 }).should("include", "logontest7.gov.bc.ca");

  cy.get("#user").type(username);
  cy.get("#password").type(password);

  cy.get('[name="btnSubmit"]').click();
});
