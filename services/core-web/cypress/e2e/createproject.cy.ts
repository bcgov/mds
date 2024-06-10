describe("Major Projects", () => {
  beforeEach(() => {
    cy.login();
  });

  it("should create a new project successfully", () => {
    const uniqueProjectName = `Cypress_${Date.now()}`;

    // Navigate to the mines page
    cy.get('[data-cy="mines-button"]', { timeout: 10000 }).click({ force: true });
    cy.get('[data-cy="expand-filters-button"]').click({ force: true });
    cy.contains("Select Mine Classification").click({ force: true });
    cy.get('[title="Major Mine"]').click({ force: true });
    cy.contains("Apply Filters").click({ force: true });
    cy.wait(3000); // wait for table to load data

    // // Navigate to the second mine
    cy.get('[data-cy="mine-link"]', { timeout: 10000 })
      .first()
      .click({ force: true });

    // Hover over the permits and approvals menu
    cy.get('[data-menu-id^="rc-menu-"][data-menu-id$="permits-and-approvals"]', { timeout: 15000 })
      .scrollIntoView()
      .trigger("mouseover", { force: true });

    // Go to major projects
    cy.get('[data-cy="major-projects-link"]').click({ force: true });

    // Create a new project
    cy.get('[data-cy="create-new-project"]', { timeout: 15000 }).click({ force: true });

    // Fill in project details
    cy.get("#project_summary_title", { timeout: 15000 }).type(uniqueProjectName, { force: true });
    cy.get("#project_summary_description").type("This is just a Cypress test project description", {
      force: true,
    });

    // SAVE & CONTINUE - skip to Purpose & Authorization
    cy.contains("Save & Continue").click({ force: true });
    cy.contains("Project Lead", { timeout: 10000 });
    cy.contains("Purpose and Authorization", { timeout: 10000 }).click({ force: true });
    cy.contains("Regulatory Approval Type", { timeout: 10000 });

    cy.get('[data-cy="checkbox-authorization-OTHER"]').click({ force: true });
    cy.get(
      '[name="authorizations.OTHER[0].authorization_description"]'
    ).type("legislation description", { force: true });

    // SAVE & CONTINUE - direct to Project Contacts
    cy.contains("Save & Continue").click({ force: true });
    cy.contains("First Name", { timeout: 10000 });

    cy.get(`[name="contacts[0].first_name"]`).type("Cypress", { force: true });
    cy.get(`[name="contacts[0].last_name"]`).type("Test", { force: true });
    cy.get(`[name="contacts[0].email"]`).type("cypress@mds.com", { force: true });
    cy.get(`[name="contacts[0].phone_number"]`).type("1234567890", { force: true });
    cy.get(`[name="contacts[0].address.address_line_1"]`).type("123 Fake St", { force: true });
    cy.get(`#ADD_EDIT_PROJECT_SUMMARY_contacts[0].address.address_type_code`).click({
      force: true,
    });
    cy.get('[title="Canada"]').click({ force: true });
    cy.get(`[name="contacts[0].address.city"]`).type("Cityville", { force: true });
    cy.get(`#ADD_EDIT_PROJECT_SUMMARY_contacts[0].address.sub_division_code`).click({
      force: true,
    });
    cy.get('[title="AB"]').click({ force: true });
    cy.get(`[name="contacts[0].address.post_code"]`).type("A0A0A0", { force: true });

    // SAVE & CONTINUE - skip to Declaration
    cy.contains("Save & Continue").click({ force: true });
    cy.contains("Applicant Information", { timeout: 10000 });
    cy.contains("Declaration", { timeout: 10000 }).click({ force: true });

    cy.get("input#ADD_EDIT_PROJECT_SUMMARY_confirmation_of_submission", { timeout: 10000 }).click({
      force: true,
    });

    // Submit the project
    cy.contains("Submit").click({ force: true });
    // wait for API to respond before navigating
    cy.wait(15000);
    // Navigate back to projects
    cy.get('[data-cy="back-to-project-link"]').click({ force: true });
    cy.wait(15000);
    // Navigate back to major projects
    cy.get('[data-cy="back-to-major-project-link"]').click({ force: true });
    // wait for table to load data
    cy.wait(15000); // wait for table to load data
    // Find the newly created project in the table and assert
    cy.get("[data-cy=project-name-column]", { timeout: 10000 })
      .contains(uniqueProjectName)
      .closest("tr")
      .as("targetRow");

    // // Assert that the row contains the expected data
    cy.get("@targetRow", { timeout: 10000 }).should("contain", uniqueProjectName);
  });
});
