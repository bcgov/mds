describe("Major Projects", () => {
  beforeEach(() => {
    cy.login();

    cy.get('[data-cy="home-link-button-major-projects"]', { timeout: 5000 }).click({ force: true });

    // .eq(1) selects the second row (0-based index).
    cy.get("[data-cy=major-projects-table-open-button]", { timeout: 5000 })
      .eq(1)
      .find("button")
      .click({ force: true });

    cy.get('a[data-cy="project-description-view-link"]', { timeout: 5000 }).click();

    // Wait for the edit button to be visible and click it
    cy.get("#project-summary-submit").then(($button) => {
      $button[0].click();
    });
  });

  it("should upload a document successfully", () => {
    const fileName = "dummy.pdf";

    cy.fixture(fileName).then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: fileName,
        mimeType: "application/pdf",
      });

      // Mock the API call with a regular expression in the URL pattern
      cy.intercept(
        "POST",
        /.*\/(api\/)?projects\/.*\/project-summaries\/.*\/documents\?mine_guid=.*$/,
        (req) => {
          req.reply((res) => {
            res.send({
              statusCode: 200,
              delay: 1000,
            });
          });
        }
      ).as("uploadComplete");

      // Wait for the mocked PATCH request to complete
      cy.wait("@uploadComplete");

      // Make the PATCH request
      cy.intercept("PATCH", /(?:\/document-manager)?\/documents\/.*$/, (req) => {
        req.reply((res) => {
          res.send({
            statusCode: 200,
            delay: 1000,
          });
        });
      }).as("patchComplete");

      // Wait for the mocked PATCH request to complete
      cy.wait("@patchComplete");

      // Make the GET request
      cy.intercept("GET", /(?:\/api)?\/mines\/documents\/upload\/.*$/, (req) => {
        req.reply((res) => {
          res.send({
            statusCode: 200,
            delay: 1000,
          });
        });
      }).as("getComplete");

      // Wait for the mocked GET request to complete
      cy.wait("@getComplete");

      // Wait for the "Upload complete" text to appear within a maximum of 25 seconds.
      cy.contains(".filepond--file-status-main", "Upload complete", { timeout: 25000 });
    });
  });

  it("should download a document successfully", () => {
    cy.get("[data-cy=menu-actions-button]")
      .first()
      .click({ force: true });

    // Click the Download file button in the dropdown
    cy.contains("button", "Download file", { timeout: 1000 })
      .find("div")
      .click({ force: true });

    // Wait for the file to download
    cy.url().then((url) => {
      // Make an HTTP request to the URL
      cy.request(url).then((response) => {
        // Check the response status code
        expect(response.status).to.eq(301);
      });
    });
  });
});
