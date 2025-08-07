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

  it("Create two projects and navigate between them using ProjectSelector", () => {
    // Create first project
    cy.visit("/my-projects");
    cy.contains("Projects").should("be.visible");
    cy.contains("button", "Create").should("be.visible").click();
    cy.url().should("include", "/projects/create");

    const firstProjectName = `First Project ${Date.now()}`;
    cy.get('input[name="name"]').type(firstProjectName);
    cy.contains("button", "Save").click();
    cy.contains("Successfully added a new project!").should("be.visible");

    // Navigate back to projects list
    cy.visit("/my-projects");
    cy.contains(firstProjectName).should("be.visible");

    // Create second project
    cy.contains("button", "Create").should("be.visible").click();
    cy.url().should("include", "/projects/create");

    const secondProjectName = `Second Project ${Date.now()}`;
    cy.get('input[name="name"]').type(secondProjectName);
    cy.contains("button", "Save").click();
    cy.contains("Successfully added a new project!").should("be.visible");

    // Navigate back to projects list to verify both projects exist
    cy.visit("/my-projects");
    cy.contains(firstProjectName).should("be.visible");
    cy.contains(secondProjectName).should("be.visible");

    // Navigate to a page where ProjectSelector is visible (try dashboard first, fallback to home)
    cy.visit("/").then(() => {
      // Check if ProjectSelector is visible on dashboard, if not try home page
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="project-selector"]').length === 0) {
          cy.visit("/");
        }
      });
    });

    // Wait for ProjectSelector to be visible and verify current project
    cy.get('[data-testid="project-selector"]', { timeout: 15000 }).should("be.visible");
    
    // Click on the ProjectSelector to open the dropdown menu
    cy.get('[data-testid="project-selector"]').click();

    // Verify both projects appear in the dropdown menu
    cy.get('[role="menu"]', { timeout: 10000 }).should("be.visible").within(() => {
      cy.contains(firstProjectName).should("be.visible");
      cy.contains(secondProjectName).should("be.visible");
    });

    // Switch to the first project
    cy.get('[role="menu"]').within(() => {
      cy.contains(firstProjectName).click();
    });

    // Wait for page reload after project switch - the switchProject function calls window.location.reload()
    cy.wait(2000); // Give time for the reload to complete
    
    // Verify we're still logged in and not redirected to login
    cy.url({ timeout: 15000 }).should("not.include", "/login");

    // Verify the ProjectSelector now shows the first project
    cy.get('[data-testid="project-selector"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-testid="project-selector"]').should("contain.text", firstProjectName);

    // Test switching back to the second project
    cy.get('[data-testid="project-selector"]').click();
    
    cy.get('[role="menu"]', { timeout: 10000 }).should("be.visible").within(() => {
      cy.contains(secondProjectName).should("be.visible").click();
    });

    // Wait for page reload after project switch
    cy.wait(2000); // Give time for the reload to complete
    
    // Verify we're still logged in
    cy.url({ timeout: 15000 }).should("not.include", "/login");

    // Verify the ProjectSelector now shows the second project
    cy.get('[data-testid="project-selector"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-testid="project-selector"]').should("contain.text", secondProjectName);

    // Test the "View all" option in the dropdown
    cy.get('[data-testid="project-selector"]').click();
    
    cy.get('[role="menu"]', { timeout: 10000 }).should("be.visible").within(() => {
      cy.contains("View all").should("be.visible").click();
    });

    // Verify navigation to projects list page
    cy.url({ timeout: 10000 }).should("include", "/my-projects");
    cy.contains("Projects").should("be.visible");
    cy.contains(firstProjectName).should("be.visible");
    cy.contains(secondProjectName).should("be.visible");
  });
});
