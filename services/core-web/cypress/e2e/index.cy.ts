describe("Login Page", () => {
  const username = Cypress.env("test-user");
  const password = Cypress.env("test-pwd");
  const url = Cypress.env("url");

  beforeEach(() => {
    cy.visit(url);
  });

  it("should successfully log in", () => {
    cy.url({ timeout: 10000 }).should("include", "test.loginproxy.gov.bc.ca");
    cy.get("a#social-idir").click();
    cy.url({ timeout: 10000 }).should("include", "logontest7.gov.bc.ca");

    cy.get("#user").type(username);
    cy.get("#password").type(password);

    cy.get('[name="btnSubmit"]').click();

    // Assert that landing on the home page is successful
    cy.url().should("include", "/home");
  });
});
