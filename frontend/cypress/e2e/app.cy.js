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
});
