
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ForgotPwdPage from '../../../pages/authentication/forgot-pwd.page';


describe('On Forgot Password Initialisation', () => {
	const initialState = { authReducer: { rmbMeEmail: '', token: '' } }
	const mockStore = configureStore([thunk]);
	let store;

	const server = setupServer(
		rest.post('/auth/forgot-password', (req, res, ctx) => {
			console.log('/auth/forgot-password has been intercepted by mock api')
			return res(ctx.json({ "message": "Success Test!" }))
		}),
	)

	beforeAll(() => server.listen());

	afterEach(() => server.resetHandlers());

	afterAll(() => server.close());

	beforeEach(() => {
		store = mockStore(initialState);
		render(
			<Provider store={store}>
				<MemoryRouter>
					<ForgotPwdPage />
				</MemoryRouter>
			// </Provider>
		);
	});

	it('should show forgot password form', () => {
		expect(screen.getByRole('form', { name: /Forgot Password Form/i })).toBeVisible();
	});

	it('should allow email to be entered', () => {
		expect(screen.getByPlaceholderText(/example@ntu.edu.sg/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/example@ntu.edu.sg/i)).toBeEnabled();
	});

	it('should not display error messages when component is loaded', () => {
		expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
		expect(screen.queryByText(/Password field is empty!/i)).toBeNull();
	});

	it('should display error messages if fields are empty but button is clicked', async () => {
		act(() => {
			fireEvent.submit(screen.getByRole('button', { name: /Submit Form Button/i }))
		});

		expect(await screen.findAllByRole("alert")).toHaveLength(1);
		expect(screen.getByText("Email field is empty!")).toBeVisible();
	});

	it('should allow form submission and display successful request sent message', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);

		await act(async () => {
			fireEvent.input(emailInput, {
				target: { value: "mock_user@ntu.edu.sg" }
			}
			);

			await fireEvent.submit(screen.getByRole('button', { name: /Submit Form Button/i }))
		});


		await waitFor(() => {
			expect(emailInput).toHaveValue("mock_user@ntu.edu.sg");

			expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
			expect(screen.getByText('Recovery Request Sent Successfully')).toBeVisible();
		});

	});

})