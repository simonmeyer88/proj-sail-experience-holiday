import { adminCredentials } from "./data";

describe("template spec", () => {
  beforeEach(() => {
    cy.seedDb();
  });
  it("passes", () => {
    cy.login(adminCredentials.email, adminCredentials.password);

    cy.contains("Gestión de cursos").click();
    cy.url().should("include", "management/courses");

    // confirm there are 2 courses
    cy.getByTestId("course-card").should("have.length", 2);

    // click on the first course
    cy.getByTestId("course-card")
      .first()
      .within((card) => {
        // initial predefined events for course 1 is 3
        cy.getByTestId("predefined-event-item").should("have.length", 3);

        cy.getByTestId("create-predefined-event-form").within((form) => {
          // Fill in the form
          cy.getByName("title").clear().type("Salida barco");

          // Submit the form
          cy.getSubmit().click();
        });

        // predefined events for course 1 is now 4
        cy.getByTestId("predefined-event-item").should("have.length", 4);
        cy.getByTestId("predefined-event-item")
          // TODO - this should be a better selector
          .filter(":contains('Salida barco')")
          .within((item) => {
            cy.contains("Salida barco");
            cy.getByTestId("pred-event-quantity").contains("1");

            cy.getByTestId("increment-pred-event-quantity-button").click();
            cy.getByTestId("pred-event-quantity").contains("2");

            cy.getByTestId("decrement-pred-event-quantity-button").click();
            cy.getByTestId("pred-event-quantity").contains("1");
          });
      });
  });
});
