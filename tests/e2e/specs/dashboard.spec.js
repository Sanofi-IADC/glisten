describe('Glisten dashboard', () => {
  beforeEach(() => {
    cy.visitGlisten();
  });

  it('loads the dashboard with filters, charts, and feedback table', () => {
    cy.contains('button', 'Add feedback').should('be.visible');
    cy.get('.dashoard-container').should('exist');
    cy.contains('.text-h5', 'Applications').should('be.visible');
    cy.contains('label', 'GLISTEN').should('exist');
    cy.contains('label', 'iadc-portal').should('exist');
    cy.get('.feedback-data-table').should('be.visible');
    cy.get('.feedback-data-table tbody tr').should('have.length', 3);
  });

  it('displays aggregated CSAT score from feedback ratings', () => {
    cy.get('.dashoard-container .csat-score-card .text-h4')
      .invoke('text')
      .then((text) => {
        expect(parseFloat(text)).to.be.closeTo(4, 0.1);
      });
    cy.get('.dashoard-container .csat-score-card').contains('CSAT').should('be.visible');
  });

  it('renders NPS and distribution charts', () => {
    cy.get('.dashoard-container .apexcharts-canvas').should('have.length.at.least', 4);
    cy.get('.nps-line-chart .apexcharts-canvas').should('exist');
    cy.get('.nps-bar-chart .apexcharts-canvas').should('exist');
    cy.get('.nps-score-gauge .apexcharts-canvas').should('exist');
    cy.get('.nps-detail-card .apexcharts-canvas').should('exist');
  });

  it('shows feedback content in the data table', () => {
    cy.get('.feedback-data-table').should('contain.text', 'Jane Doe');
    cy.get('.feedback-data-table').should('contain.text', 'John Smith');
    cy.get('.feedback-data-table').should('contain.text', 'Alex Lee');
  });
});
