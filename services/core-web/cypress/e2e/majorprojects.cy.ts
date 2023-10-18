describe("Major Projects", () => {
    beforeEach(() => {
        cy.login();
        cy.wait(5000);

        // Get the button element by its text content
        cy.contains('button', 'Major Projects')
            // Check that it is visible and enabled
            .should('be.visible')
            .and('not.be.disabled')
            // Click on it
            .click({ force: true });

        // Find the table and wait for it to be visible
        cy.get('table[style="table-layout: auto;"]').should('be.visible').find('tbody > tr').eq(1) // get the second row
            .find('button:contains("Open")').click({ force: true }); // find the button that contains the text "Open"

        // Find the row with "Project description", then find the "View" button within that row and click on it.
        cy.get('tbody.ant-table-tbody').contains('td', 'Project description')
            .siblings().find('button:contains("View")').click();

        // Wait for the submit button to be visible and click it
        cy.get('#project-summary-submit').then(($button) => {
            $button[0].click();
        });
    });

    it("should upload a document successfully", () => {
        // Access the file input element and attach a file from the fixtures directory.
        cy.get('input[type="file"]').scrollIntoView().attachFile('dummy.pdf');

        cy.wait(25000);
        cy.get('.filepond--file-status-main').should('have.text', 'Upload complete');

        // Save the changes without force
        cy.contains('button', 'Save Changes').should('be.visible').click({ force: true });
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
