/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    login: (email: string, password: string) => void;
    logout: () => void;
    getByTestId: (testId: string) => Chainable;
    getByName: (name: string) => Chainable;
    getSubmit: () => Chainable;
    seedDb: () => void;
    getToast: (type: ToastType) => Chainable;
  }
}

type ToastType = "success" | "error";

Cypress.Commands.add("getToast", (type: ToastType) => {
  return cy.get("[data-sonner-toast][data-type='" + type + "']");
});

Cypress.Commands.add("getByName", (name) => {
  return cy.get(`[name=${name}]`);
});

Cypress.Commands.add("logout", () => {
  cy.clearAllCookies();
  cy.visit("/");
});

Cypress.Commands.add("getSubmit", { prevSubject: "optional" }, (subject) => {
  if (subject) {
    cy.wrap(subject);
  }
  return cy.get("[type='submit']");
});

Cypress.Commands.add("login", (email, password) => {
  cy.logout();
  cy.url().should("contain", "auth/sign-in");
  cy.getByName("email").type(email);
  cy.getByName("password").type(password);
  cy.getSubmit().click();
  cy.url().should("not.contain", "/sign-in");
});

Cypress.Commands.add(
  "getByTestId",
  { prevSubject: "optional" },
  (subject, testId) => {
    if (subject) {
      cy.wrap(subject);
    }
    return cy.get(`[data-testid='${testId}']`);
  }
);

Cypress.Commands.add("seedDb", () => {
  cy.exec("npm --workspace=@aula-anclademia/backend run db:seed");
});
