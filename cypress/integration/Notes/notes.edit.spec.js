
describe('Test Editing Existing Notes', () => {
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

    it('should be able to view one selected note, and show a text editor', () => {
        cy.contains('div','CZ3002 notes v1.1').parent('div').parent('div').within(() => {
            cy.findByRole('button', {  name: /view notes/i}).click();
        })
        expect(cy.get(`[aria-label="quill editor"]`)).to.be.exist    
	});

    it('should be able to type in new notes', () => {
		cy.get(`[aria-label="quill editor"]`).type('hello testing');
        expect(cy.contains('p','hello testing')).to.be.exist   
	});

    it('should be able to save it and persist the data', () => {
        cy.findByRole('button', {  name: /save notes/i}).click();
        cy.contains('div','CZ3002 notes v1.1').parent('div').parent('div').within(() => {
            cy.findByRole('button', {  name: /view notes/i}).click();
        })
        expect(cy.contains('p','hello testing')).to.be.exist;
	});
});