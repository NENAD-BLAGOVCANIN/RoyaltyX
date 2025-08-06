describe('RoyaltyX App', () => {
  it('should load the homepage and display correct title', () => {
    // Visit the homepage
    cy.visit('/');
    
    // Check that the page title is correct
    cy.title().should('eq', 'Royalty X - World\'s Best Royalty Management Tool');
    
    // Check that the page loads successfully (status 200)
    cy.request('/').its('status').should('eq', 200);
    
    // Check that the root element exists
    cy.get('#root').should('exist');
    
    // Wait for the app to load and check for some basic content
    // Since this is a React app with authentication, we might see a login form or loading state
    cy.get('body').should('be.visible');
    
    // Check that JavaScript is working (React app should render)
    cy.get('#root').should('not.be.empty');
  });

  it('should have proper meta tags and SEO elements', () => {
    cy.visit('/');
    
    // Check for favicon
    cy.get('link[rel="icon"]').should('exist');
    
    // Check for viewport meta tag
    cy.get('meta[name="viewport"]').should('exist');
    
    // Check that the page is responsive
    cy.viewport(375, 667); // Mobile viewport
    cy.get('#root').should('be.visible');
    
    cy.viewport(1280, 720); // Desktop viewport
    cy.get('#root').should('be.visible');
  });

  it('should handle 404 pages gracefully', () => {
    // Visit a non-existent page
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    
    // Should still load the React app (SPA routing)
    cy.get('#root').should('exist');
  });
});
