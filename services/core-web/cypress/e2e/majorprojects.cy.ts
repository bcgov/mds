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
            // Check that the request was made
            expect(interception.response.statusCode).to.equal(301);
            // You can also assert other things about the response if needed
        });
    });

});
