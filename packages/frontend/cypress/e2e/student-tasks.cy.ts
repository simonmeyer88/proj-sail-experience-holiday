describe("student tasks", () => {
  const STUDENT_ID = "student1";
  const STUDENT_NAME = {
    first: "John",
    last: "Doe",
  };
  before(() => {
    cy.seedDb();
  });
  context("management", () => {
    before(() => {
      cy.login("alex@example.com", "password");
      cy.visit("/management/students/" + STUDENT_ID + "/tasks");
    });

    it("should list tasks", () => {
      cy.contains(STUDENT_NAME.first + " " + STUDENT_NAME.last).should("exist");
      cy.getByTestId("event-card")
        .should("have.length", 5)
        .first()
        .as("firstCard");

      cy.getByTestId("pending-task-card").should("have.length", 0);

      cy.get("@firstCard").contains("Both courses event").should("exist");

      cy.getByTestId("event-card-menu-trigger").first().click();

      cy.getByTestId("event-card-menu-dropdown").should("exist");

      cy.getByTestId("event-card-menu-dropdown").contains("Eliminar").click();

      cy.getByTestId("alert-confirm").within(() => {
        cy.get("button").contains("Eliminar").click();
      });

      cy.getByTestId("event-card").should("have.length", 4);

      cy.getByTestId("pending-task-card").should("have.length", 1);

      cy.getByTestId("pending-task-card")
        .contains("Both courses event")
        .should("exist");

      cy.getByTestId("pending-task-card").within(() => {
        cy.getByTestId("mark-as-completed").click();
      });

      cy.getByTestId("event-card").should("have.length", 5);

      cy.getByTestId("pending-task-card").should("have.length", 0);
    });
  });
});
