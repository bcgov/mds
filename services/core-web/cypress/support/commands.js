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
  cy.visit("localhost:3000");
  cy.get("#username").type(Cypress.env("test-user"));
  cy.get("#password")
    .click()
    .type(Cypress.env("test-pwd"));
  cy.get("#kc-form-login").submit();
  cy.url().should("eq", "http://localhost:3000/home/");
});
