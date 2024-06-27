const dayjs = require("dayjs");

describe('Testing Offline Transcribe', () => {

	it('should be able to log in, upload an audio file and see changes in view-all-jobs and log out', () => {
		cy.visit('http://localhost:3000');

		cy.findByRole('text', { name: /email input/i }).type(Cypress.env('testuserEmail'));
		cy.findByRole('text', { name: /password input/i }).type(Cypress.env('testuserPassword'));

		cy.findByRole('button', { name: /login button/i }).click();

		cy.findByRole('link', { name: /offline transcribe/i }).click();

		cy.get('input[type=file]').selectFile({
			contents: 'cypress/fixtures/test_audio_file.m4a',
			fileName: 'test_audio_file.m4a',
			mimeType: 'audio/mp4'
		}, { force: true });

		cy.intercept('/speech').as('uploadFile')
		cy.findByRole('button', {  name: /upload/i}).click();
		const timeUploaded = "File Upload on " + dayjs().format("ddd D MMM YYYY, h:mma");
		cy.wait('@uploadFile').then(
			(interception) => {
				cy.findByRole('link', {  name: /view all jobs/i}).click();

				const regExp = new RegExp(timeUploaded, "i")
				cy.findByText(regExp).should('be.visible')
			}
		)

	});
});