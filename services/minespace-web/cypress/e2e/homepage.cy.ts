describe("Mines Page", () => {
  const url = Cypress.env("CYPRESS_MINESPACE_WEB_TEST_URL");
  beforeEach(() => {
    cy.login();
  });

  it("should navigate to the mines page successfully", () => {
    cy.visit(`${url}/mines`);
    // Assert that landing on the home page is successful
    cy.url({ timeout: 15000 }).should("include", "/mines");
    cy.get("h1.ant-typography").should("have.text", "My Mines");
    cy.get("h4.ant-typography").should("have.text", "Welcome, cypress@bceid.");
    cy.contains("Evergreen Cypress Mine").should("exist");
    cy.contains("Evergreen Cypress Mine").click();
    cy.get("h1.ant-typography").should("have.text", "Evergreen Cypress Mine");
    cy.contains(
      "This tab contains general information about your mine and important contacts at EMLI."
    ).should("exist");
  });
});
