describe("Login sample", function() {
  it("Successfully logged in", () => {
    cy.visit("localhost:3000");
    cy.get("#username").type("bdd-test-create");
    cy.get("#password")
      .click()
      .type("JiAX90*pk7L&5r2GbE@m");
    cy.get("#kc-form-login").submit();
    cy.url().should("eq", "http://localhost:3000/home/");
  });
});

// describe("My First Test", () => {
//   it("Does not do much!", () => {
//     cy.visit("http://localhost:3000/home/");
//     cy.get("#active-menu-btn > span").click();
//     cy.get(".full-mobile > span:nth-child(2)").click();
//     cy.get("#mine_status").click();
//     cy.get(
//       ".ant-row:nth-child(1) .ant-row .ant-legacy-form-item-control .ant-col:nth-child(1)"
//     ).click();
//     cy.get("#mine_name").click();
//     cy.get("#mine_name").type("Test1");
//     cy.get(".ant-cascader-picker-label").click();
//     cy.get(".ant-cascader-menu-item-active").click();
//     cy.get(".ant-select-focused").click();
//     cy.get(".ant-select-item-option-active > .ant-select-item-option-content").click();
//     cy.get("#mine_note").click();
//     cy.get("#mine_note").type("This is a test mine");
//     cy.get(".ant-checkbox-wrapper > span:nth-child(2)").click();
//     cy.get("#major_mine_ind").click();
//     cy.get(".ant-btn-loading").click();
//     cy.get("div > .ant-legacy-form").submit();
//   });
// });
