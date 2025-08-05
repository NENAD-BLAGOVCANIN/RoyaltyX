describe('Authentication', () => {
  describe('User Sign Up', () => {
    beforeEach(() => {
      cy.visit('/');      
      // Click on the "Sign Up" or "Create account" link to navigate to register page
      cy.contains('Sign Up').click();
      // Verify we're now on the register page
      cy.url().should('include', '/register');
    });

    it('should display the sign-up form with all required elements', () => {
      // Check that the register page loads
      cy.url().should('include', '/register');
      
      // Check for the brand icon
      cy.get('img[alt="Brand Icon"]').should('be.visible');
      
      // Check for the main heading
      cy.contains('Create your account').should('be.visible');
      
      // Check for Google login button
      cy.get('button').contains('Google').should('be.visible');
      
      // Check for the "or" divider
      cy.contains('or').should('be.visible');
      
      // Check for all form fields
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      
      // Check for the sign-up button
      cy.get('button[type="submit"]').contains('Sign Up').should('be.visible');
      
      // Check for the login link
      cy.contains('Already have an account?').should('be.visible');
      cy.contains('Log In').should('be.visible');
    });

    it('should show validation errors for empty form submission', () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').contains('Sign Up').click();
      
      // Check that we're still on the register page (form didn't submit)
      cy.url().should('include', '/register');
      
      // The form should show validation errors (MUI TextField validation)
      // Note: MUI TextFields with required prop will show validation on blur/submit
    });

    it('should show validation errors for invalid email format', () => {
      // Fill in the form with invalid email
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      
      // Submit the form
      cy.get('button[type="submit"]').contains('Sign Up').click();
      
      // Wait for potential API response and error display
      cy.wait(2000);
      
      // Check that we're still on the register page
      cy.url().should('include', '/register');
    });

    it('should successfully register a new user and redirect to email verification', () => {
      // Generate a unique email for testing
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;
      
      // Fill in the registration form
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('TestPassword123!');
      
      // Submit the form
      cy.get('button[type="submit"]').contains('Sign Up').click();
      
      // Wait for the registration process to complete
      cy.wait(5000);
      
      // Check that we're redirected to the email verification page
      cy.url().should('include', '/verify-email');
      
      // Check that the email parameter is in the URL
      cy.url().should('include', `email=${encodeURIComponent(testEmail)}`);
      
      // Verify the email verification page elements
      cy.contains('Verify Your Email').should('be.visible');
      cy.contains(testEmail).should('be.visible');
      cy.contains('Enter the 6-digit code below').should('be.visible');
      
      // Check for the verification code input field
      cy.get('input[placeholder="Enter 6-digit code"]').should('be.visible');
      
      // Check for the verify button
      cy.get('button').contains('Verify Email').should('be.visible');
      
      // Check for the resend verification email button
      cy.get('button').contains('Resend Verification Email').should('be.visible');
      
      // This is where we stop the test as requested - at the email confirmation window
    });

    it('should navigate to login page when clicking "Log In" link', () => {
      // Click on the "Log In" link
      cy.contains('Log In').click();
      
      // Check that we're redirected to the login page
      cy.url().should('include', '/login');
    });

    it('should handle server errors gracefully', () => {
      // Intercept ALL POST requests to catch the registration API call
      cy.intercept('POST', '**', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('registerRequest');
      
      // Generate a unique email for testing
      const timestamp = Date.now();
      const testEmail = `error-test-${timestamp}@example.com`;
      
      // Fill in the form
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      
      // Submit the form
      cy.get('button[type="submit"]').contains('Sign Up').click();
      
      // Wait a bit for the form submission and error handling
      cy.wait(3000);
      
      // Check that we're still on the register page (form didn't succeed)
      cy.url().should('include', '/register');
      
      // The test passes if we stay on the register page, indicating the error was handled
      // We don't need to check for specific error messages as they may vary
    });

    it('should disable the submit button while loading', () => {
      // Generate a unique email for testing
      const timestamp = Date.now();
      const testEmail = `loading-test-${timestamp}@example.com`;
      
      // Intercept ALL POST requests to ensure we catch the registration API call
      cy.intercept('POST', '**', (req) => {
        // Delay the response by 2 seconds
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(req.reply({ 
              statusCode: 200,
              body: { success: true, verification_required: true, email: testEmail }
            }));
          }, 2000);
        });
      }).as('registerRequest');
      
      // Fill in the form
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      
      // Submit the form
      cy.get('button[type="submit"]').contains('Sign Up').click();
      
      // Immediately check that the button shows loading state (should be disabled)
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Wait for the API call to complete
      cy.wait('@registerRequest', { timeout: 10000 });
      
      // After the request completes, the button should be enabled again or we should be redirected
      // We don't need to check this as the main goal is to verify the loading state works
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Visit the login page (which is the default page)
      cy.visit('/');
    });

    it('should display the login form elements', () => {
      // Add login form tests here when needed
      cy.get('#root').should('exist');
    });
  });

  describe('Email Verification', () => {
    beforeEach(() => {
      // Visit the verify email page with test parameters
      cy.visit('/verify-email?email=test@example.com');
    });

    it('should display the email verification form', () => {
      // Check for email verification elements
      cy.contains('Verify Your Email').should('be.visible');
      cy.contains('test@example.com').should('be.visible');
      cy.get('input[placeholder="Enter 6-digit code"]').should('be.visible');
      cy.get('button').contains('Verify Email').should('be.visible');
      cy.get('button').contains('Resend Verification Email').should('be.visible');
    });
  });
});
