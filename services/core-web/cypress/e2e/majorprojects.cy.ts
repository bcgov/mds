describe("Major Projects", () => {
    const fileName = "dummy.pdf";
    beforeEach(() => {
        cy.login();

        cy.get('[data-cy="home-link-button-major-projects"]', { timeout: 5000 }).click();

        // .eq(1) selects the second row (0-based index).
        cy.get("[data-cy=major-projects-table-open-button]", { timeout: 5000 })
            .eq(1)
            .find("button")
            .click();


        cy.get('a[data-cy="project-description-view-link"]', { timeout: 5000 }).click();

        // Wait for the edit button to be visible and click it
        cy.get('#project-summary-submit').then(($button) => {
            $button[0].click();
        });
    });

    it("should upload a document successfully", () => {

        cy.fixture(fileName).then(fileContent => {
            cy.get('input[type="file"]').attachFile({
                fileContent: fileContent,
                fileName: fileName,
                mimeType: 'application/pdf'
            });

            // Wait for the "Upload complete" text to appear within a maximum of 25 seconds.
            cy.contains('.filepond--file-status-main', 'Upload complete', { timeout: 25000 });
        });

        // Save the changes without force
        cy.contains('button', 'Save Changes').should('be.visible').click({ force: true });
    });

    it('should download a document successfully', () => {

        // Find the row with 'dummy.pdf', scroll it into view, and hover over its 'Actions' button
        cy.contains('tr', fileName)
            .scrollIntoView()
            .within(() => {
                // Hover over the 'Actions' button within the row
                cy.get('[data-cy=menu-actions-button]')
                    .trigger('mouseover', { force: true });
            });

        // Click the Download file button in the dropdown
        cy.contains('button', 'Download file', { timeout: 1000 })
            .find('div')
            .click({ force: true });

        // Wait for the file to download
        cy.url().then((url) => {
            // Make an HTTP request to the URL
            cy.request(url).then((response) => {
                // Check the response status code
                expect(response.status).to.eq(301);
            });
        });

        // Wait for file to download before continuing
        cy.wait(5000);

        /**
         * Clean up by deleting file after downloading. This is to ensure that the 
         * upload file runs multiple times without any issue
         */

        // Click the delete button in the dropdown
        cy.contains('button', 'Delete')
            .find('div')
            .click({ force: true });

        // Click 'Delete' within the modal
        cy.get('.ant-modal-footer', { timeout: 5000 })
            .contains('button', 'Delete')
            .click({ force: true });
    });

});
