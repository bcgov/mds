describe("Major Projects", () => {
    beforeEach(() => {
        cy.login();
        cy.contains('button', 'Major Projects', { timeout: 10000 }).click({ force: true });
        cy.get('table[style="table-layout: auto;"]', { timeout: 10000 })
            .find('tbody > tr').eq(1)  // get the second row
            .find('button:contains("Open")')  // find the button that contains the text "Open"
            .click({ force: true });

        // Find the row with "Project description", then find the "View" button within that row and click on it.
        cy.get('tbody.ant-table-tbody')
            .contains('td', 'Project description')
            .siblings() // get the sibling columns
            .find('button:contains("View")') // find the button with text "View"
            .click();

        cy.get('#project-summary-submit', { timeout: 10000 }).click({ force: true });
    });

    it("should upload a document successfully", () => {
        // Access the file input element and attach a file from the fixtures directory.
        cy.get('input[type="file"]').scrollIntoView().attachFile('dummy.pdf');

        // Verify that the "Upload complete" message is displayed
        cy.get('.filepond--file-status-main', { timeout: 20000 }).should('have.text', 'Upload complete');

        // Save the changes
        cy.contains('button', 'Save Changes').click({ force: true });
    });

    it('should download a document successfully', () => {

        // Find the row with 'dummy.pdf', scroll it into view, and hover over its 'Actions' button
        cy.contains('tr', 'dummy.pdf')
            .scrollIntoView()
            .within(() => {
                // Hover over the 'Actions' button within the row
                cy.get('.ant-btn.ant-btn-default.ant-dropdown-trigger.permit-table-button')
                    .trigger('mouseover', { force: true });
            });
        // Wait here for dropdown to appear
        cy.wait(1000);

        // Click the Download file button in the dropdown
        cy.contains('button', 'Download file')
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

        cy.wait(10000);

        // Click 'Delete' within the modal
        cy.get('.ant-modal-footer')
            .contains('button', 'Delete')
            .click({ force: true });
    });

});
