describe("Major Projects", () => {
    beforeEach(() => {
        cy.login();

        cy.get('[data-cy="home-link-button-major-projects"]', { timeout: 10000 }).click({ force: true });

        // .eq(1) selects the second row (0-based index).
        cy.get("[data-cy=major-projects-table-open-button]", { timeout: 10000 })
            .eq(1)
            .find("button")
            .click({ force: true });

        cy.get('a[data-cy="project-description-view-link"]', { timeout: 5000 }).click();
    });

    it("should upload a document successfully", () => {

        const fileName = 'dummy.pdf';

        cy.get("#project-summary-submit").then(($button) => {
            $button[0].click();
        });

        cy.fixture(fileName).then((fileContent) => {
            const apiUrlRegex = /.*\/(api\/)?projects\/.*\/project-summaries\/.*\/documents\?mine_guid=.*$/;

            // Intercept the POST request and stub the response
            cy.intercept('POST', apiUrlRegex, {
                statusCode: 200,
                body: { message: "file uploaded successfully" }, // Stubbed response
            }).as('uploadRequest');

            cy.get('input[type="file"]').attachFile({
                fileContent: fileContent,
                fileName: fileName,
                mimeType: 'application/pdf',
            });

            // Wait for the upload request to complete (simulated)
            cy.wait('@uploadRequest').then((interception) => {
                // Assert that the response body contains the expected message
                expect(interception.response.body.message).to.equal("file uploaded successfully");
            });
        });

    });

    it("should download a document successfully", () => {
        // search for the first pdf file to download as they(.pdf files) are the easiest to test.
        cy.get('.ant-table-cell:contains(".pdf")')
            .first()
            .parent()
            .find('[data-cy="menu-actions-button"]')
            .click({ force: true });

        // Click the Download file button in the dropdown
        cy.contains("button", "Download file", { timeout: 3000 })
            .find("div")
            .click({ force: true });

        cy.url().then((url) => {
            // Make an HTTP request to the URL
            cy.request(url).then((response) => {
                // Check the response status code
                expect(response.status).to.eq(301);
            });

        });
    });
});
