import 'cypress-file-upload';
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
    });

    it("should upload a file successfully", () => {
        cy.get('#project-summary-submit', { timeout: 10000 }).click({ force: true });

        // Access the file input element and attach a file from the fixtures directory.
        cy.get('input[type="file"]').scrollIntoView().attachFile('dummy.pdf');

        cy.get('button').each((button: any) => {
            cy.wrap(button).invoke('text').then((text: string) => {
                if (text.trim() === 'Save Changes') {
                    cy.wrap(button).click({ force: true });
                }
            });
        });
    });

    it('should download a document successfully', () => {
        cy.get('table tbody.ant-table-tbody tr:first-child a').scrollIntoView().click({ force: true });
    });

});
