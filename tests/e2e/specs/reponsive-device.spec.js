describe('Testing calendar view ', () => {
  // before each test, make sure to visit the home page of the app
  beforeEach(() => {
    cy.visit('/'); // "baseUrl" is defined in cypress.json file
  });

  context('Checkin device of responsive', () => {
    /* Small devices (portrait tablets and large phones, 600px and up) */
    it.only('should allow me to see rportrait tablets and large phones, 600px and up', () => {
      cy.viewport(600, 768);
    });
    /* Medium devices (landscape tablets, 768px and up) */
    it.only('should allow me to see responsive landscape tablets, 768px and up', () => {
      cy.viewport(768, 500);
    });
    /* Large devices (laptops/desktops, 992px and up) */
    it.only('should allow me to see responsive  of laptops/desktops, 992px and up', () => {
      cy.viewport(992, 768);
    });
    /* medium devices (medium laptops and desktops, 1200px and up) */
    it.only('should allow me to see responsive  medium laptops and desktops, 1200px and up', () => {
      cy.viewport(1200, 920);
    });
    /* Extra large devices (large laptops and desktops, 1200px and up) */
    it.only('should allow me to see responsive  large laptops and desktops, 1200px and upsssss', () => {
      cy.viewport(1400, 920);
    });
  });
});
