describe("Mines Page", () => {
  const url = Cypress.env("CYPRESS_MINESPACE_WEB_TEST_URL");
  beforeEach(() => {
    // cy.login();
  });

  it("should navigate to the mines page successfully", () => {
    cy.visit(`${url}/mines`);
    // Assert that landing on the home page is successful
    // cy.url({ timeout: 10000 }).should("include", "/mines");
  });
});
