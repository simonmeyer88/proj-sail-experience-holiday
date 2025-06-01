import { extractTokenOrCodeFromEmailText } from "./utils";

describe("profile page", () => {
  context("update profile", () => {
    it("should update profile admin", () => {
      cy.login("alex@example.com", "password");
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="prof-pic"]').click();
      cy.contains(/perfil/gi).click();
      cy.url().should("include", "/profile");

      cy.getByName("firstName").clear().type("Pepe");
      cy.getByName("lastName").clear().type("Perez");
      cy.getByName("phoneNumber").clear().type("+44 7911 123455");
      cy.getByName("birthDate").should("not.exist");
      cy.getByName("address").should("not.exist");
      cy.getByName("zipCode").should("not.exist");
      cy.getByName("city").should("not.exist");
      cy.getByName("idNumber").should("not.exist");
      cy.getByName("idIssueDate").should("not.exist");
      cy.getByName("isInClub").should("not.exist");
      cy.getByName("courseId").should("not.exist");
      cy.getSubmit().click();
      cy.contains(/updated/gi);
    });

    it("should update profile student", () => {
      cy.login("john@example.com", "password");
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="prof-pic"]').click();
      cy.contains(/perfil/gi).click();
      cy.url().should("include", "/profile");

      cy.getByName("firstName").clear().type("Pepe");
      cy.getByName("lastName").clear().type("Perez");
      cy.getByName("phoneNumber").clear().type("+44 7911 123456");
      cy.getByName("birthDate").clear().type("1990-01-01");
      cy.getByName("address").clear().type("Calle 1");
      cy.getByName("zipCode").clear().type("12345");
      cy.getByName("city").clear().type("Madrid");
      cy.getByName("idNumber").clear().type("12345678A");
      cy.getByName("idIssueDate").clear().type("2010-01-01");
      cy.getByName("isInClub").should("not.exist");
      cy.getByName("courseId").should("not.exist");
      cy.getSubmit().click();
      cy.contains(/updated/gi);
    });

    it("should update profile teacher", () => {
      cy.login("alice@example.com", "password");
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="prof-pic"]').click();
      cy.contains(/perfil/gi).click();
      cy.url().should("include", "/profile");

      cy.getByName("firstName").clear().type("Pepe");
      cy.getByName("lastName").clear().type("Perez");
      cy.getByName("phoneNumber").clear().type("+34 655677731");
      cy.getByName("birthDate").should("not.exist");
      cy.getByName("address").should("not.exist");
      cy.getByName("zipCode").should("not.exist");
      cy.getByName("city").should("not.exist");
      cy.getByName("idNumber").should("not.exist");
      cy.getByName("idIssueDate").should("not.exist");
      cy.getByName("isInClub").should("not.exist");
      cy.getByName("courseId").should("not.exist");
      cy.getSubmit().click();
      cy.contains(/updated/gi);
    });
  });

  context.only("change email", () => {
    before(() => {
      cy.seedDb();
    });
    it("should change email", () => {
      cy.login("alex@example.com", "password");
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="prof-pic"]').click();
      cy.contains(/perfil/gi).click();
      cy.url().should("include", "/profile");

      cy.getByTestId("toggle-email-form").click();
      // Get a new email to change to
      cy.task("getUserEmail", { reuse: false }).then((newEmail: string) => {
        cy.wrap(newEmail).as("newEmail");
        cy.getByTestId("request-code-form")
          .should("be.visible")
          .within(() => {
            cy.getByName("email").clear().type(newEmail);
            cy.getSubmit().click();
          });
      });
      cy.getByTestId("request-code-form").should("not.exist");
      cy.getByTestId("sent-code-form").should("be.visible");
      cy.getByTestId("sent-code-alert").should("be.visible");

      cy.wait(3000);

      cy.task("getLastEmail").then((email: any) => {
        // six consecutive digits
        const emailVerificationCode = extractTokenOrCodeFromEmailText(
          email.text,
          { mode: "changeEmail" }
        );
        cy.getByTestId("sent-code-form").within(() => {
          cy.getByName("emailVerificationCode").type(emailVerificationCode);
          cy.getByName("password").type("password");
          cy.getSubmit().click();
        });
      });

      // we need to reload to req csrf token

      cy.wait(1000);
      cy.logout();
      cy.reload();
      // login with old email should error
      cy.visit("/auth/sign-in");
      cy.getByName("email").type("alex@example.com");
      cy.getByName("password").type("password");
      cy.getSubmit().click();
      cy.contains(/invalid/gi);
      cy.contains(/try again/gi).click();
      // login with new email should work
      cy.visit("/auth/sign-in");

      cy.get("@newEmail").then((newEmail: any) => {
        cy.getByName("email").clear().type(newEmail);
      });
      cy.getByName("password").clear().type("password");
      cy.getSubmit().click();
      cy.url().should("include", "/dashboard");
    });
  });
});
