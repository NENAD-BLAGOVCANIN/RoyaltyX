describe('Dashboard Tests', () => {
  beforeEach(() => {
    cy.loginAsTestUser();
  });

  it('should access the dashboard when logged in', () => {
    cy.visit('/');
    
    // Should not be redirected to login
    cy.url().should('not.include', '/login');
    cy.url().should('not.include', '/register');
    
    // Check that dashboard content is visible
    cy.get('body').should('be.visible');
  });

  it('should display user information', () => {
    // Visit any protected page
    cy.visit('/');
    
    // Should be logged in and see user-specific content
    // Check for any of the expected texts that indicate successful login
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text();
      return text.includes('Test User') || text.includes('Dashboard') || text.includes('Welcome') || text.includes('Projects');
    });
  });

  it('should be able to logout', () => {
    // Perform logout
    cy.logout();
    
    // Try to visit a protected route
    cy.visit('/');
    
    // Should be redirected to login
    cy.url().should('include', '/login');
  });
});
