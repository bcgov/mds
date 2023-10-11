import 'cypress-file-upload';
describe("Major Projects", () => {
    beforeEach(() => {
        cy.login();
    });

    it("should upload a file to the major projects page successfully", () => {
        cy.url({ timeout: 10000 }).should("include", "/home");
        cy.contains('button', 'Major Projects').click();
        cy.get('.ant-table-tbody', { timeout: 10000 })
            .find('tr')
            .first()
            .find('button')
            .contains('Open')
            .click({ force: true }); // The force option is needed because the button is hidden in the DOM

        // Find the row with "Project description", then find the "View" button within that row and click on it.
        cy.get('tbody.ant-table-tbody')
            .contains('td', 'Project description')
            .siblings() // get the sibling columns
            .find('button:contains("View")') // find the button with text "View"
            .click();
        // Directly target the button by its ID and click on it.
        cy.get('#project-summary-submit').click({ force: true });

        // Access the file input element and attach a file from the fixtures directory.
        cy.get('input[type="file"]').attachFile('dummy.pdf');
        cy.get('label[id^="filepond--drop-label-"]').invoke('attr', 'for').then((inputId) => {
            cy.get(`input[id="${inputId}"]`).attachFile('dummy.pdf');
        });

        cy.get('button').each(button => {
            cy.wrap(button).invoke('text').then(text => {
                if (text.trim() === 'Save Changes') {
                    cy.wrap(button).click({ force: true });

                    // Add any assertions or additional commands if needed after each click
                }
            });
        });

        // Hover over the first caret-down icon
        cy.get('.anticon-caret-down').first().trigger('mouseover', { force: true });

        // Assuming the dropdown has a class name "dropdown-menu" and the option "Download File" is a list item
        // You might need to adjust this depending on the actual structure of your dropdown
        cy.get('.dropdown-menu').should('be.visible').within(() => {
            cy.contains('Download file').click({ force: true });
        });

    });

});
