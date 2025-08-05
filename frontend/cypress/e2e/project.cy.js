describe("Project Management", () => {
  beforeEach(() => {
    cy.loginAsTestUser();
  });

  it("Create new project and verify it appears in the project list", () => {

    cy.contains("Projects").should("be.visible");
    cy.contains("Find all your personal and shared projects").should("be.visible");
    cy.contains("button", "Create").should("be.visible").click();
    cy.url().should("include", "/projects/create");

    const projectName = `Test Project ${Date.now()}`;

    cy.get('input[name="name"]').type(projectName);
    cy.contains("button", "Save").click();
    cy.contains("Successfully added a new project!").should("be.visible");
    cy.visit("/my-projects");

    // Verify the created project appears in the list
    cy.contains(projectName).should("be.visible");

  });
});
