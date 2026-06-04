import { resetGraphQLMockState } from './graphql-mock';

Cypress.Commands.add('mockWhisprApi', (options = {}) => {
  resetGraphQLMockState(options);
});

Cypress.Commands.add('visitGlisten', (path = '/') => {
  cy.mockWhisprApi();
  const url = path.includes('?') ? `${path}&cypress=1` : `${path}?cypress=1`;
  cy.visit(url);
  cy.get('.feedback-data-table tbody tr', { timeout: 15000 }).should('have.length', 3);
});

Cypress.Commands.add('openFeedbackSheet', () => {
  cy.contains('button', 'Add feedback').click();
  cy.get('.sheet--feedback').should('be.visible');
});

Cypress.Commands.add('fillFeedbackForm', ({ feedback, category, anonymous, actionRequired } = {}) => {
  if (feedback !== undefined) {
    cy.get('.sheet--feedback textarea').clear().type(feedback);
  }
  if (category) {
    cy.get('.sheet--feedback .v-select').first().click();
    cy.get('.v-overlay--active .v-list-item-title').contains(category).click();
  }
  if (anonymous) {
    cy.contains('.v-switch', 'Make my feedback anonymous').click();
  }
  if (actionRequired) {
    cy.contains('.v-switch', 'Action expected').click();
  }
});

Cypress.Commands.add('submitFeedbackForm', () => {
  cy.contains('.sheet--feedback button', 'Submit feedback').click();
});
