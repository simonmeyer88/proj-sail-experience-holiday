import { extractTokenOrCodeFromEmailText } from "./utils";

describe("Auth flow", () => {
  let email: string;

  const password = "Password0";
  const changedPassword = "Password1";
  const failedPassword = "Password2";

  let registerVerificationCode: string;

  let changedPasswordVerificationCode: string;
  before(() => {
    cy.logout();
    cy.task("getUserEmail", { reuse: false }).then((userEmail: string) => {
      email = userEmail;
    });
  });

  context("Register", () => {
    it("should register", () => {
      cy.visit("/");
      cy.getByTestId("sign-up-link").click();
      cy.url().should("include", "/sign-up");
      cy.getByName("email").type(email);
      cy.getSubmit().click();

      // we are in the create account page now

      cy.getByTestId("email-sent-alert").should("exist");
      cy.getByName("email").should("have.value", email).should("be.disabled");
      cy.getByName("password").type(password);
      cy.getByName("passwordConfirmation").type(password);
      cy.task("getLastEmail").then(({ text }: { text: string }) => {
        const emailVerificationCode = extractTokenOrCodeFromEmailText(text, {
          mode: "register",
        });
        registerVerificationCode = emailVerificationCode;
      });
      // generate another
      cy.getByTestId("resend-email-btn").click();

      cy.wait(3000);
      cy.task("getLastEmail").then(({ text }: { text: string }) => {
        const emailVerificationCode = extractTokenOrCodeFromEmailText(text, {
          mode: "register",
        });
        expect(emailVerificationCode).not.to.equal(registerVerificationCode);

        // try to register with the old code
        cy.getByName("emailVerificationCode").type(registerVerificationCode);
        cy.getSubmit().click();
        cy.getToast("error").should("exist");
        registerVerificationCode = emailVerificationCode;

        // try to register with the new code
        cy.getByName("emailVerificationCode")
          .clear()
          .type(emailVerificationCode);
        cy.getSubmit().click();

        cy.url().should("include", "/onboarding");
      });

      cy.getSubmit().click();

      cy.url().should("include", "/onboarding");
    });
    it("should not register with existing email", () => {
      cy.visit("/");
      cy.getByTestId("sign-up-link").click();
      cy.url().should("include", "/sign-up");

      cy.getByName("email").type(email);
      cy.getSubmit().click();

      cy.getToast("error").should("exist");
    });
  });
  context("Forgot password", () => {
    it("should reset password", () => {
      cy.visit("/auth/sign-in");
      cy.getByTestId("forgot-password-link").click();
      cy.url().should("include", "/auth/password-reset");
      cy.getByName("email").type(email);
      cy.getSubmit().click();
      cy.wait(5000);

      cy.task("getLastEmail").then(({ text }: { text: string }) => {
        changedPasswordVerificationCode = extractTokenOrCodeFromEmailText(
          text,
          {
            mode: "forgotPassword",
          }
        );
      });

      cy.getByTestId("email-sent-alert")
        .should("exist")
        .getByTestId("resend-email-btn")
        .should("exist")
        .click();

      cy.wait(5000);

      cy.task("getLastEmail").then(({ text }: { text: string }) => {
        const code = extractTokenOrCodeFromEmailText(text, {
          mode: "forgotPassword",
        });

        expect(code).not.to.equal(changedPasswordVerificationCode);
        cy.getByName("email").should("have.value", email).should("be.disabled");

        cy.getByName("newPassword").type(changedPassword);
        cy.getByName("confirmNewPassword").type(changedPassword);

        // old code, should fail
        cy.getByName("token").type(changedPasswordVerificationCode);
        cy.getSubmit().click();

        cy.wait(1000);

        // new code, should succeed
        cy.getByName("token").clear().type(code);
        cy.getSubmit().click();

        //redirects
        cy.url().should("include", "/auth/sign-in");
      });
    });

    it("should not reset password with invalid token/email combo", () => {
      cy.visit("/auth/sign-in");
      cy.getByTestId("forgot-password-link").click();
      cy.url().should("include", "/auth/password-reset");
      cy.getByName("email").type(email);
      cy.getSubmit().click();

      cy.getByName("email").should("have.value", email).should("be.disabled");
      cy.getByName("token").type("invalid token");
      cy.getByName("newPassword").type(failedPassword);
      cy.getByName("confirmNewPassword").type(failedPassword);
      cy.getSubmit().click();
      cy.url().should("include", "/auth/password-reset");
    });

    it("should be able to login with new password", () => {
      cy.visit("/auth/sign-in");
      cy.url().should("include", "/auth/sign-in");
      cy.getByName("email").type(email);
      cy.getByName("password").clear().type(changedPassword);
      cy.getSubmit().click();
      cy.url().should("not.include", "/auth/sign-in");
    });

    it("should not be able to login with old password", () => {
      cy.visit("/auth/sign-in");
      cy.url().should("include", "/auth/sign-in");
      cy.getByName("email").type(email);
      cy.getByName("password").clear().type(password);
      cy.getSubmit().click();
      cy.url().should("include", "/auth/sign-in");
    });

    it("should not be able to login with password that did not change ", () => {
      cy.visit("/auth/sign-in");
      cy.url().should("include", "/auth/sign-in");
      cy.getByName("email").type(email);
      cy.getByName("password").clear().type(failedPassword);
      cy.getSubmit().click();
      cy.url().should("include", "/auth/sign-in");
    });
  });
});
