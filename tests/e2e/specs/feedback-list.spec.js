describe('Feedback list', () => {
  beforeEach(() => {
    cy.visitGlisten();
  });

  it('expands a row to show context and notes', () => {
    cy.contains('.feedback-data-table tbody tr', 'Jane Doe')
      .find('button')
      .last()
      .click({ force: true });

    cy.contains('Context').should('be.visible');
    cy.contains('Page :').should('be.visible');
    cy.contains('Notes').should('be.visible');
  });

  it('copies a feedback id to the clipboard', () => {
    cy.get('.feedback-id').first().click();
    cy.contains('copied to clipboard').should('be.visible');
  });

  it('marks action-needed feedback as done', () => {
    cy.contains('.feedback-data-table tbody tr', 'John Smith')
      .find('input[type="checkbox"]')
      .click({ force: true });

    cy.wait('@gqlFeedbacks');
    cy.reload();
    cy.get('.feedback-data-table tbody tr', { timeout: 15000 }).should('have.length.at.least', 1);
    cy.contains('.feedback-data-table tbody tr', 'John Smith')
      .find('input[type="checkbox"]')
      .should('be.checked');
  });

  it('updates admin notes for a feedback item', () => {
    cy.contains('.feedback-data-table tbody tr', 'Alex Lee')
      .find('td')
      .eq(8)
      .find('.v-icon')
      .click({ force: true });

    cy.get('.v-overlay--active textarea').clear().type('E2E note update');

    cy.wait('@gqlFeedbacks');
  });
});
