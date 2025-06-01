describe("videos spec manager", () => {
  before(() => {
    cy.seedDb();
  });
  beforeEach(() => {
    cy.login("alex@example.com", "password");
  });
  it("passes admin browsing", () => {
    cy.url().should("include", "/dashboard");
    cy.wait(1000);
    cy.getByTestId("sidebar-link-management.videos").click();

    // video folder switching
    cy.get("[data-cy='course-select']").contains("Course 1");
    cy.contains("June 2023").should("have.class", "btn-success");
    cy.contains("Course 1");
    cy.contains("Course 1_2");
    cy.contains("Course 1_3");
    cy.getByTestId("yt-video-card").should("have.length", 3);

    cy.contains("January 2024").should("have.class", "btn-secondary").click();
    cy.getByTestId("yt-video-card").should("have.length", 6);
    cy.contains("January 2024").should("have.class", "btn-success");

    // switch courses
    cy.get("[data-cy='course-select']").select("Course 2").contains("Course 2");

    // cy not contains june 2023
    cy.get("June 2023").should("not.exist");

    cy.contains("July 2023").should("have.class", "btn-success").click();
    cy.contains("January 2024").should("have.class", "btn-secondary");

    cy.contains("Course 2");
    cy.contains("Course 2_2");

    cy.getByTestId("yt-video-card").should("have.length", 2);
  });

  it("passes admin video creation", () => {
    cy.url().should("include", "/dashboard");
    cy.getByTestId("sidebar-link-management.videos").click();

    // select course 2 and folder1
    cy.get("[data-cy='course-select']").select("Course 1");

    // click add video
    cy.contains("Add video").click();

    // check modal
    cy.contains("New video");
    cy.get("[name='title']").type("Video 9");
    cy.get("[name='url']").type("https://www.youtube.com/watch?v=oY0PBQt36YM");

    // select course 1, forced
    cy.get(".multiselect-search input").type("Course 1{enter}", {
      force: true,
    });

    cy.get("[name='date']").clear().type("2023-10-01");

    // submit
    cy.getSubmit().click();

    cy.contains("October 2023").should("have.class", "btn-secondary").click();

    // check video is in the list
    cy.contains("Video 9");
  });
});

describe("videos spec student", () => {
  beforeEach(() => {
    cy.login("john@example.com", "password");
  });

  it("passes student browsing", () => {
    cy.url().should("include", "/dashboard");
    cy.getByTestId("sidebar-link-student.videos").click();

    //Student is in course  1

    cy.contains(/Course 1/gi);
    cy.contains("June 2023").click().should("have.class", "btn-success");
    cy.getByTestId("yt-video-card").should("have.length", 3);

    cy.contains("October 2023").should("have.class", "btn-secondary").click();
    cy.getByTestId("yt-video-card").should("have.length", 1);
    cy.contains("Video 9");

    cy.contains("January 2024").should("have.class", "btn-secondary").click();
    cy.getByTestId("yt-video-card").should("have.length", 6);
  });
});
