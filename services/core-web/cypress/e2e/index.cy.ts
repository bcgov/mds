describe("Home Page", () => {
  const url = Cypress.env("CYPRESS_CORE_WEB_TEST_URL");
  beforeEach(() => {
    cy.login();
  });

  it("should navigate to the home page successfully", () => {
    cy.visit(`${url}/home`);
    // Assert that landing on the home page is successful
    cy.url({ timeout: 10000 }).should("include", "/home");
  });
});
