describe("Mine Tests", () => {
  it("Creates a Mine", { scrollBehavior: false }, () => {
    cy.login();
    cy.get("span")
      .contains("Mines")
      .click();
    cy.get("#create-mine-record").click();
    cy.get("#mine_name").type("Test");
    cy.get(".ant-cascader-picker-label").click();
    cy.get("li")
      .contains("Abandoned")
      .click();
    cy.get("#mine_region").click();
    cy.get(".ant-select-item-option-content")
      .contains("North East")
      .click();
    cy.get("#mine_note").click();
    cy.get("#mine_note").type("Test Mine");
    cy.get(
      ".ant-legacy-form-item-children .ant-col:nth-child(1) > .ant-legacy-form-item-control"
    ).click();
    cy.get("#major_mine_ind").click();
    cy.get("#mine-record-submit").click();
    cy.get("#search").click();
    cy.get("#search").type("Test");
    cy.get("span")
      .contains("Apply Filters")
      .click();
  });

  it("Edits a Mine", { scrollBehavior: false }, () => {
    cy.visit("localhost:3000");
    cy.url().should("eq", "http://localhost:3000/home/");
    cy.get("span")
      .contains("Mines")
      .click();
    cy.get("#search").click();
    cy.get("#search").type("Test");
    cy.get("span")
      .contains("Apply Filters")
      .click();
    cy.get("table")
      .contains("Test")
      .click();
    cy.get("div")
      .contains("Add/Edit")
      .trigger("mouseover");
    cy.get("#updateMine").click({ force: true });
    cy.get("#mine_name")
      .clear()
      .type("Test Mine");
    cy.get("#mine-record-submit").click();
  });
});
