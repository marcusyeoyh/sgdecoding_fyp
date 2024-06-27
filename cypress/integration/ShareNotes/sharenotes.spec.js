
describe('Share notes by one user to another user', () => {
	it('should be able to log in', () => {
        cy.visit('http://localhost:3000');

        cy.findByRole('text', { name: /email input/i }).type(Cypress.env('othertestuserEmail'));
		
        cy.findByRole('text', { name: /password input/i }).type(Cypress.env('testuserPassword'));
		
        cy.findByRole('button', { name: /login button/i }).click();
	});

    it('should be able to select the notes sidebar button, and navigate to share notes page', () => {
        cy.findByRole('button', { name: /expand menu/i }).click();

		cy.get(`[aria-label="notes page"]`).click();
	});

    it('should be able to select one note and click share', () => {
        cy.contains('div', Cypress.env('shareNotesTitle')).parent('div').parent('div').within(() => {
            cy.findByRole('button', {  name: /SHARE/i}).click();
        })
	});

    it('should be able to share it to other user', () => {
        cy.findByRole('text', { name: /Collaborator email input/i }).type(Cypress.env('testuserEmail'));
        cy.findByRole('button', {  name: /Share Notes Button/i}).click();
	});

    it('should be able to logout', () => {
        cy.findByRole('listbox', {  name: /profile dropdown/i}).click();
        cy.findByRole('option', {  name: /log out option/i}).click();
    });

    it('should be able to log in to other user', () => {
        cy.findByRole('text', { name: /email input/i }).type(Cypress.env('testuserEmail'));
        cy.findByRole('text', { name: /password input/i }).type(Cypress.env('testuserPassword'));
        cy.findByRole('button', { name: /login button/i }).click();
	});

    it('should be able to select the notes sidebar button, and navigate to share notes page', () => {
        cy.findByRole('button', { name: /expand menu/i }).click();
		
		cy.get(`[aria-label="share notes page"]`).click();
	});

    it('should contain the shared note', () => {
        expect(cy.contains('div', Cypress.env('shareNotesTitle'))).to.be.exist;
	});
    
});