const dayjs = require("dayjs");

describe('Testing Live Transcribe', () => {

	it('should be able to log in, perform live transcribe, and see new live transcribe job, and log out', () => {
		cy.visit('http://localhost:3000');

		cy.findByRole('text', {  name: /email input/i}).type(Cypress.env('testuserEmail'));
		cy.findByRole('text', {  name: /password input/i}).type(Cypress.env('testuserPassword'));

		cy.findByRole('button', {  name: /login button/i}).click();	
		
		cy.findByRole('link', {  name: /live transcribe/i}).click();

		cy.findByRole('button', {  name: /start record button/i}).click();	
		cy.wait(2000);

		cy.findByRole('button', {  name: /stop record button/i}).click();	
		const test = "Live Transcribe on " + dayjs().format("ddd D MMM YYYY, h:mma");

		cy.findByRole('link', {  name: /view all jobs/i}).click();

		const regExp = new RegExp(test, "i")
		cy.findByText(regExp).should('be.visible')
		
	});
});