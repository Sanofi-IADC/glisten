describe('Dashboard filters', () => {
  beforeEach(() => {
    cy.visitGlisten();
  });

  it('filters feedback by application', () => {
    cy.contains('label', 'iadc-portal').click();
    cy.wait('@gqlFeedbacks');
    cy.get('.feedback-data-table tbody tr').should('have.length', 1);
    cy.contains('.feedback-data-table', 'Performance is slow on mobile').should('be.visible');

    cy.contains('label', 'iadc-portal').click();
    cy.wait('@gqlFeedbacks');
    cy.get('.feedback-data-table tbody tr').should('have.length', 3);
  });

  it('displays the selected date range on the filter button', () => {
    cy.get('.filter .v-btn')
      .invoke('text')
      .should('match', /\w+ \d{1,2}, \d{4}\s*-\s*\w+ \d{1,2}, \d{4}/);
  });
});
