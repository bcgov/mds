describe("Major Projects", () => {
  beforeEach(() => {
    cy.login();
  });

  it("should upload and download a document successfully", () => {
    const fileName = "dummy.pdf";

    cy.get('[data-cy="home-link-button-major-projects"]', { timeout: 10000 }).click({
      force: true,
    });

    // .eq(1) selects the second row (0-based index).
    cy.get("[data-cy=major-projects-table-open-button]", { timeout: 10000 })
      .eq(1)
      .find("button")
      .click({ force: true });

    cy.get('a[data-cy="project-description-view-link"]', { timeout: 5000 }).click();

    cy.get("#project-summary-submit").then(($button) => {
      $button[0].click();
    });

    cy.fixture(fileName).then((fileContent) => {
      // Intercept the POST request and stub the response
      cy.intercept(
        "POST",
        /.*\/(api\/)?projects\/.*\/project-summaries\/.*\/documents\?mine_guid=.*$/,
        {
          statusCode: 200,
          body: { message: "file uploaded successfully" }, // Stubbed response
        }
      ).as("uploadRequest");

      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: fileName,
        mimeType: "application/pdf",
      });

      // Wait for the upload request to complete (simulated)
      cy.wait("@uploadRequest").then((interception) => {
        // Assert that the response body contains the expected message
        expect(interception.response.body.message).to.equal("file uploaded successfully");
      });
    });

    // Intercept the GET request and stub the response
    cy.intercept("GET", "**/documents**", (req) => {
      // Set the desired response properties
      req.reply({
        statusCode: 301,
        body: "Mocked response data",
      });
    }).as("downloadRequest");

    cy.get("[data-cy=menu-actions-button]")
      .first()
      .click({ force: true });

    // Click the Download file button in the dropdown
    cy.contains("button", "Download file", { timeout: 3000 })
      .find("div")
      .click({ force: true });

    // Wait for the network request to complete
    cy.wait("@downloadRequest").then((interception) => {
      // Check that the download request was made successfully
      expect(interception.response.statusCode).to.equal(301);
    });
  });

  it("should add a new major project successfully", () => {
    const uniqueProjectName = `Cypress_${Date.now()}`;

    cy.get('[data-cy="mines-button"]', { timeout: 10000 }).click({
      force: true,
    });

    cy.get("#search", { timeout: 10000 }).type("Brenda mine", { force: true });

    cy.get('[data-cy="apply-filter-button"]').click();

    cy.get('[data-cy="mine-link"]', { timeout: 10000 })
      .eq(0)
      .click({
        force: true,
      });

    cy.get('[data-menu-id^="rc-menu-"][data-menu-id$="permits-and-approvals"]', { timeout: 10000 })
      .scrollIntoView()
      .trigger("mouseover", { force: true });

    cy.get('[data-cy="major-projects-link"]', { timeout: 10000 }).click({
      force: true,
    });

    cy.get('[data-cy="create-new-project"]', { timeout: 10000 }).click({
      force: true,
    });

    cy.get("#project_summary_title").type(uniqueProjectName, { force: true });
    cy.get("#project_summary_description").type("This is just a cypress test project description", {
      force: true,
    });
    cy.get("#mrc_review_required")
      .contains("No")
      .click({ force: true });
    cy.get("#contacts\\[0\\]\\.name").type("Cypress", { force: true });
    cy.get("#contacts\\[0\\]\\.email").type("cypress@mds.com", { force: true });
    cy.get("#contacts\\[0\\]\\.phone_number").type("1234567890", { force: true });

    cy.get('[data-cy="project-summary-submit-button"]').click({
      force: true,
    });

    cy.wait(10000);

    cy.get('[data-cy="back-to-project-link"]').click({
      force: true,
    });

    cy.wait(10000);

    cy.get('[data-cy="back-to-major-project-link"]').click({
      force: true,
    });

    cy.get("[data-cy=project-name-column]", { timeout: 10000 })
      .contains(uniqueProjectName)
      .closest("tr")
      .as("targetRow");

    // Assert that the row contains the expected data
    cy.get("@targetRow").should("contain", uniqueProjectName);
  });
});
