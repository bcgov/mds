describe("Home Page", () => {
  const url = Cypress.env("url");
  beforeEach(() => {
    cy.login();
  });

  it("should navigate to the home page successfully", () => {
    // Assert that landing on the home page is successful
    cy.url().should("include", "/home");
  });
});
