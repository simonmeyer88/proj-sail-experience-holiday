describe("User Management", () => {
  before(() => {
    cy.seedDb();
    cy.login("alex@example.com", "password");
  });

  it("can navigate tabs", () => {
    cy.visit("/management/users");

    cy.url().should("include", "/management/users");

    cy.contains("Students").click();
    cy.getByTestId("students-tab").should("be.visible");

    cy.getByTestId("progress-bar").should("have.length", 10).first();
    cy.getByTestId("progress-value").should("have.length", 10);

    cy.contains("Teachers").click();
    cy.getByTestId("teachers-tab").should("be.visible");

    cy.contains("Administrators").click();
    cy.getByTestId("admins-tab").should("be.visible");

    cy.contains("Awaiting approval").click();
    cy.getByTestId("approval-tab").should("be.visible");

    cy.contains("New users").click();
    cy.getByTestId("new-users-tab").should("be.visible");
  });
});
