describe('Glisten feedback client', () => {
  beforeEach(() => {
    cy.visitGlisten();
  });

  it('opens the feedback bottom sheet', () => {
    cy.openFeedbackSheet();
    cy.contains('.sheet--feedback', "We're always looking to improve").should('be.visible');
    cy.get('.sheet--feedback .v-rating').should('exist');
    cy.contains('.sheet--feedback', 'Choose category').should('be.visible');
    cy.contains('.sheet--feedback', 'Speak your mind').should('be.visible');
  });

  it('keeps submit disabled until feedback text is entered', () => {
    cy.openFeedbackSheet();
    cy.contains('.sheet--feedback button', 'Submit feedback').should('be.disabled');
    cy.fillFeedbackForm({ feedback: 'A' });
    cy.contains('.sheet--feedback button', 'Submit feedback').should('not.be.disabled');
  });

  it('hides the name field when anonymous feedback is enabled', () => {
    cy.openFeedbackSheet();
    cy.contains('.sheet--feedback', 'Your name').should('be.visible');
    cy.fillFeedbackForm({ anonymous: true });
    cy.contains('.sheet--feedback', 'Your name').should('not.exist');
  });

  it('submits feedback successfully', () => {
    cy.openFeedbackSheet();
    cy.fillFeedbackForm({
      feedback: 'E2E test feedback submission',
      actionRequired: true,
    });
    cy.submitFeedbackForm();
    cy.get('.v-snackbar', { timeout: 10000 }).should('contain.text', 'Thanks for your feedback');
  });

  it('shows an error snackbar when submission fails', () => {
    cy.mockWhisprApi({ mutations: { succeed: false } });
    cy.visit('/?cypress=1');
    cy.get('.feedback-data-table tbody tr', { timeout: 15000 }).should('have.length', 3);

    cy.openFeedbackSheet();
    cy.fillFeedbackForm({ feedback: 'This submission should fail' });
    cy.submitFeedbackForm();
    cy.get('.v-snackbar', { timeout: 10000 }).should('contain.text', 'An error occured');
  });
});
