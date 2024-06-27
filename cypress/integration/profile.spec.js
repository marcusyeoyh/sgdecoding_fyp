
describe('Testing Profile', () => {
	it('should be able to log in, change password, change back to old password and log out', () => {
		cy.visit('http://localhost:3000');

		cy.findByRole('text', { name: /email input/i }).type(Cypress.env('testuserEmail'));
		cy.findByRole('text', { name: /password input/i }).type(Cypress.env('testuserPassword'));

		cy.findByRole('button', { name: /login button/i }).click();

		cy.findByRole('listbox', { name: /profile dropdown/i }).click();

		cy.findByRole('option', { name: /my profile option/i }).click();

		cy.findByRole('button', { name: /change password/i }).click();

		cy.findByRole('text', { name: /current password input/i }).type(Cypress.env('testuserPassword'));
		cy.findByRole('text', { name: /new password input/i }).type(Cypress.env("testuserNewPassword"));
		cy.findByRole('text', { name: /confirm password input/i }).type(Cypress.env("testuserNewPassword"));

		cy.findByRole('button', { name: /change my password/i }).click();

		cy.findByText(/you are logged out!/i).should('be.visible');

		cy.findByRole('text', { name: /email input/i }).type(Cypress.env('testuserEmail'));
		cy.findByRole('text', { name: /password input/i }).type(Cypress.env("testuserNewPassword"));

		cy.findByRole('button', { name: /login button/i }).click();

		cy.findByRole('listbox', { name: /profile dropdown/i }).click();

		cy.findByRole('option', { name: /my profile option/i }).click();

		cy.findByRole('button', { name: /change password/i }).click();

		cy.findByRole('text', { name: /current password input/i }).type(Cypress.env("testuserNewPassword"));
		cy.findByRole('text', { name: /new password input/i }).type(Cypress.env("testuserPassword"));
		cy.findByRole('text', { name: /confirm password input/i }).type(Cypress.env('testuserPassword'));

		cy.findByRole('button', { name: /change my password/i }).click();
	});

	it('should be able to log in, change profile name, change back to old profile name and log out', () => {
		cy.visit('http://localhost:3000');

		cy.findByRole('text', { name: /email input/i }).type(Cypress.env('testuserEmail'));
		cy.findByRole('text', { name: /password input/i }).type(Cypress.env('testuserPassword'));

		cy.findByRole('button', { name: /login button/i }).click();

		cy.findByRole('listbox', { name: /profile dropdown/i }).click();

		cy.findByRole('option', { name: /my profile option/i }).click();

		cy.findByRole('button', { name: /change your name/i }).click();
		cy.findByRole('text', { name: /new name input/i }).type("Tester123");
		cy.findByRole('button', { name: /change my name/i }).click();

		cy.findByText(/change name successful/i).should('be.visible');
		cy.findByText(/tester123/i).should('be.visible');

		cy.findByRole('text', { name: /new name input/i }).clear().type("Tester8392");
		cy.findByRole('button', { name: /change my name/i }).click();

		cy.findByText(/change name successful/i).should('be.visible');
		cy.findByText(/tester8392/i).should('be.visible');
		
	});
});