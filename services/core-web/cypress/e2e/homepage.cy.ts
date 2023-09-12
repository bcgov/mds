describe("Home Page", () => {
  const url = Cypress.env("CYPRESS_CORE_WEB_TEST_URL") || "http://localhost:3000";
  beforeEach(() => {
    cy.login();
  });

  it("should navigate to the home page successfully", () => {
    cy.url({ timeout: 10000 }).should("include", "/home");
    cy.get("h1").should("have.text", "Welcome back to CORE");
  });
});
