describe("Home Page", () => {
  const url = Cypress.env("url");
  beforeEach(() => {
    cy.login();
  });

  it("should navigate to the home page successfully", () => {
    cy.visit(`${url}/home`);
    // Assert that landing on the home page is successful
    cy.url({ timeout: 10000 }).should("include", "/home");
  });
});
