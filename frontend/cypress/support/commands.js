// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom login command using test account credentials
Cypress.Commands.add('loginAsTestUser', () => {
  const email = Cypress.env('CYPRESS_TEST_USER_EMAIL') || 'test@royaltyx.co';
  const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD') || 'WM4nvWegaC9yFYTeTTeVfy';
  
  cy.visit('/login');
  
  // Fill in the login form
  cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible').type(email);
  cy.get('input[name="password"]', { timeout: 10000 }).should('be.visible').type(password);
  
  // Submit the form
  cy.get('button[type="submit"]').contains('Log In').click();
  
  // Wait for successful login and redirect to dashboard
  cy.url({ timeout: 15000 }).should('not.include', '/login');
  cy.url().should('not.include', '/register');
  cy.url().should('not.include', '/verify-email');
});

// Alternative login command that accepts custom credentials
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  
  // Fill in the login form
  cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible').type(email);
  cy.get('input[name="password"]', { timeout: 10000 }).should('be.visible').type(password);
  
  // Submit the form
  cy.get('button[type="submit"]').contains('Log In').click();
  
  // Wait for successful login and redirect
  cy.url({ timeout: 15000 }).should('not.include', '/login');
});

// Command to login via API (faster for tests that don't need to test the login UI)
Cypress.Commands.add('loginViaAPI', () => {
  const email = Cypress.env('CYPRESS_TEST_USER_EMAIL') || 'test@royaltyx.co';
  const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD') || 'WM4nvWegaC9yFYTeTTeVfy';
  
  cy.request({
    method: 'POST',
    url: `${Cypress.config('baseUrl').replace('3000', '8000')}/api/auth/login/`,
    body: {
      email: email,
      password: password
    }
  }).then((response) => {
    // Store the authentication token or session data
    if (response.body.access_token) {
      window.localStorage.setItem('access_token', response.body.access_token);
    }
    if (response.body.refresh_token) {
      window.localStorage.setItem('refresh_token', response.body.refresh_token);
    }
  });
});

// Command to logout
Cypress.Commands.add('logout', () => {
  // Clear any stored tokens
  cy.window().then((win) => {
    win.localStorage.removeItem('access_token');
    win.localStorage.removeItem('refresh_token');
  });
  
  // Visit logout endpoint or home page
  cy.visit('/');
});
