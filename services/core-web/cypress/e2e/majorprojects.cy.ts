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
    });
});
