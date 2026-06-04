const viewports = [
  { name: 'mobile', width: 600, height: 768 },
  { name: 'tablet', width: 768, height: 500 },
  { name: 'laptop', width: 992, height: 768 },
  { name: 'desktop', width: 1200, height: 920 },
  { name: 'large desktop', width: 1400, height: 920 },
];

describe('Responsive layout', () => {
  viewports.forEach(({ name, width, height }) => {
    it(`renders the dashboard on ${name} (${width}x${height})`, () => {
      cy.viewport(width, height);
      cy.visitGlisten();

      cy.contains('button', 'Add feedback').should('be.visible');
      cy.get('.dashoard-container').should('be.visible');
      cy.get('.feedback-data-table').should('be.visible');
      cy.get('.dashoard-container .apexcharts-canvas').should('have.length.at.least', 1);
    });
  });
});
