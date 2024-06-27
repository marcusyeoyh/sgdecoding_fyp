
describe('Create New Notes', () => {
	it('should be able to log in', () => {
        cy.visit('http://localhost:3000');
        cy.findByRole('text', { name: /email input/i }).type(Cypress.env('testuserEmail'));
        cy.findByRole('text', { name: /password input/i }).type(Cypress.env('testuserPassword'));
        cy.findByRole('button', { name: /login button/i }).click();
	});

    it('should be able to select the notes sidebar button, and navigate to notes page', () => {
        cy.findByRole('button', { name: /expand menu/i }).click();
		cy.get(`[aria-label="notes page"]`).click();
	});

    it('should be able to type in notes title to be created and click on record button', () => {
        cy.findByRole('text', { name: /Notes title/i }).type(Cypress.env('newNotesTitle'));
        cy.findByRole('text', { name: /Create Note/i }).click();        
	});

    it('should be able to click save and new notes should be created', () => {
        cy.findByRole('button', { name: /SAVE/i }).click();
		cy.wait(2000);
        expect(cy.contains('div',Cypress.env('newNotesTitle'))).to.be.exist;
	});

});