import { adminCredentials } from "./data";

describe("Chat", () => {
  context("Can create chat", () => {
    it("can create new chat", () => {
      cy.login(adminCredentials.email, adminCredentials.password);
      cy.getByTestId("sidebar-link-chat").click();
      cy.url().should("include", "/chat");
      cy.getByTestId("new-chat-button").click();

      cy.getByTestId("image-input-edit").selectFile({
        mimeType: "image/jpeg",
        fileName: "profile-pic.jpg",
        contents: "cypress/test-files/picture.jpg",
      });

      cy.getByName("name").type("Chat de prueba");

      cy.getSubmit().click();
      cy.getToast("success").should("be.visible");

      cy.getByTestId("chat-sidebar-item")
        .filter(":contains('Chat de prueba')")
        .should("be.visible");
    });
  });
});
