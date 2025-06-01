describe("Onboarding", () => {
  before(() => {
    cy.seedDb();
  });
  context("Onboard as student", () => {
    it("can onboard", () => {
      const user = {
        email: "pepe@example.com",
        password: "password",
        firstName: "Pepe",
        lastName: "Perez",
        phoneNumber: "+34 655677730",
        birthDate: "1990-01-01",
        address: "123 Main St",
        zipCode: "12345",
        city: "New York",
        idNumber: "12345678aa",
        idIssueDate: "1990-01-01",
        courseId: "Course 1",
      };

      cy.login(user.email, user.password);
      cy.url().should("include", "/onboarding");
      cy.contains("Te estás registrando como estudiante");

      cy.getByName("firstName").type(user.firstName);
      cy.getByName("lastName").type(user.lastName);
      cy.getByName("phoneNumber").type(user.phoneNumber);
      cy.getByName("birthDate").type(user.birthDate);
      cy.getByName("address").type(user.address);
      cy.getByName("zipCode").type(user.zipCode);
      cy.getByName("city").type(user.city);
      cy.getByName("idNumber").type(user.idNumber);
      cy.getByName("idIssueDate").type(user.idIssueDate);
      cy.getByName("courseId").select(user.courseId);
      cy.getByName("joinClub").check();

      cy.getSubmit().click();

      cy.contains(/debes subir/gi);

      cy.getByTestId("image-input-edit").selectFile({
        mimeType: "image/jpeg",
        fileName: "profile-pic.jpg",
        contents: "cypress/test-files/picture.jpg",
      });

      cy.getSubmit().click();

      cy.url().should("include", "/awaiting-approval");

      cy.contains("Buenas, Pepe Perez");
      cy.contains("Te has registrado como alumno");
      cy.contains(user.email);

      cy.contains("Cerrar sesión").click();

      cy.url().should("include", "/auth/sign-in");
    });
  });
  context("Onboard as teacher", () => {
    it("can onboard", () => {
      const user = {
        email: "dana@example.com",
        password: "password",
        firstName: "Dana",
        lastName: "Diaz",
        phoneNumber: "+34 615677730",
      };

      cy.login(user.email, user.password);
      cy.url().should("include", "/onboarding");
      cy.contains("Te estás registrando como estudiante");
      cy.getByTestId("toggle-role-button").click();
      cy.wait(500);

      cy.contains("Te estás registrando como profesor");

      cy.getByName("firstName").type(user.firstName);
      cy.getByName("lastName").type(user.lastName);
      cy.getByName("phoneNumber").type(user.phoneNumber);

      cy.getSubmit().click();

      cy.contains(/debes subir/gi);

      cy.getByTestId("image-input-edit").selectFile({
        mimeType: "image/jpeg",
        fileName: "profile-pic.jpg",
        contents: "cypress/test-files/picture.jpg",
      });

      cy.getSubmit().click();

      cy.url().should("include", "/awaiting-approval");

      cy.contains("Buenas, Dana Diaz");
      cy.contains("Te has registrado como profesor");
      cy.contains(user.email);

      cy.contains("Cerrar sesión").click();

      cy.url().should("include", "/auth/sign-in");
    });
  });
});
