const users = {
  courseAndClub: {
    email: "john@example.com",
    password: "password",
    courseId: "course1",
  },
  course: {
    email: "jane@example.com",
    password: "password",
    courseId: "course2",
  },

  club: {
    email: "juan@example.com",
    password: "password",
  },
};

describe("Calendar", () => {
  before(() => {
    cy.seedDb();
  });
  context("User with course and club", () => {
    it("can see events from course1 and club", () => {
      cy.login(users.courseAndClub.email, users.courseAndClub.password);
      cy.visit("student/calendar");
      cy.contains("Course 1 event").should("exist");
      cy.contains("Course 2 event").should("not.exist");
      cy.contains("Evento club 3").should("exist");
    });
  });

  context("User with course", () => {
    it("can see events from course2", () => {
      cy.login(users.course.email, users.course.password);
      cy.visit("student/calendar");
      cy.contains("Course 2 event").should("exist");
      cy.contains("Course 1 event").should("not.exist");
      cy.contains("Evento club 3").should("not.exist");
    });
  });

  context("User with club", () => {
    it("can see events from club", () => {
      cy.login(users.club.email, users.club.password);
      cy.visit("student/calendar");
      cy.contains("Course 2 event").should("not.exist");
      cy.contains("Course 1 event").should("not.exist");
      cy.contains("Evento club 3").should("exist");
    });
  });
});
