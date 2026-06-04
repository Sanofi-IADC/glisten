describe('Glisten CSAT widget', () => {
  beforeEach(() => {
    cy.visitGlisten();
  });

  it('shows CSAT for the configured application filter only', () => {
    cy.get('.text-h4').should('have.length.at.least', 2);
    cy.get('.text-h4')
      .last()
      .invoke('text')
      .then((text) => {
        expect(parseFloat(text)).to.be.closeTo(3, 0.1);
      });
  });

  it('shows a different CSAT aggregate on the main dashboard', () => {
    cy.get('.dashoard-container .text-h4')
      .invoke('text')
      .then((text) => {
        expect(parseFloat(text)).to.be.closeTo(4, 0.1);
      });
  });
});
