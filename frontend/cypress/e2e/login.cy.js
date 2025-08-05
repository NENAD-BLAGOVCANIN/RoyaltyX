describe("Login", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the login form elements", () => {
    // Check that we're on the login page
    cy.url().should("include", "/login");

    // Check for login form elements
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').contains("Log In").should("be.visible");
  });

  it("should successfully login with test user credentials", () => {
    cy.loginAsTestUser();
    cy.visit("/");

    cy.url().should("not.include", "/login");
    cy.url().should("not.include", "/register");

    cy.contains("Find all your personal and shared projects").should("be.visible");
  });
});
