const admin = {
  email: "alex@example.com",
  password: "password",
};
const studentWithCourse = {
  email: "jane@example.com",
  password: "password",
};

const teacher = {
  email: "alice@example.com",
  password: "password",
};

const studentWithoutCourse = {
  email: "juan@example.com",
  password: "password",
};
const commonRoutes = ["/dashboard", "/profile"];

const studentWithoutCourseRoutes = ["/dashboard", "/student/calendar"];

const studentWithCourseRoutes = [
  "/student/videos",
  "/student/files",
  "/student/quizzes",
];

const teacherRoutes = [
  "/management/calendar",
  "/management/videos",
  "/management/files",
  "/management/quizzes",
  "/management/courses",
];

const adminRoutes = ["/admin/users"];

const studentWithCourseSidebar = [
  /Dashboard/gi,
  /Eventos/gi,
  /Videos/gi,
  /Archivos/gi,
  /Exámenes/gi,
];

const studentWithoutCourseSidebar = [/Dashboard/gi, /Eventos/gi];

const teacherSidebar = [
  /Dashboard/gi,
  /Gestión de eventos/gi,
  /Gestión de videos/gi,
  /Gestión de archivos/gi,
  /Gestión de exámenes/gi,
  /Gestión de cursos/gi,
];

const adminSidebar = [
  ...teacherSidebar,
  /Dashboard/gi,
  /Gestión de usuarios/gi,
];

describe("routes and permissions", () => {
  beforeEach(() => {
    cy.reload();
  });
  it("studentWithCourse", () => {
    cy.login(studentWithCourse.email, studentWithCourse.password);
    cy.wait(1000);

    commonRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    studentWithCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    studentWithoutCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    adminRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    teacherRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    studentWithCourseSidebar.forEach((route: RegExp) => {
      cy.contains(route).should("exist");
    });
  });

  it("studentWithoutCourse", () => {
    cy.login(studentWithoutCourse.email, studentWithoutCourse.password);
    cy.wait(1000);
    commonRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    studentWithoutCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    studentWithCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    adminRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    teacherRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    studentWithoutCourseSidebar.forEach((route: RegExp) => {
      cy.contains(route).should("exist");
    });
  });

  it("teacher", () => {
    cy.login(teacher.email, teacher.password);
    cy.wait(1000);
    teacherRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    commonRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    studentWithCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    studentWithoutCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    adminRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    teacherSidebar.forEach((route: RegExp) => {
      cy.contains(route).should("exist");
    });
  });

  it("admin", () => {
    cy.login(admin.email, admin.password);
    cy.wait(1000);
    adminRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    commonRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    studentWithCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    studentWithoutCourseRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", "/dashboard");
    });

    teacherRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(1000);
      cy.url().should("contain", route);
    });

    adminSidebar.forEach((route: RegExp) => {
      cy.contains(route).should("exist");
    });
  });
});

export {};
