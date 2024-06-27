
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ResetPasswordPage from '../../../pages/authentication/reset-password.page';


describe('On Reset Password Page Load', () => {
	const initialState = { authReducer: { rmbMeEmail: '', token: '' } }
	const mockStore = configureStore([thunk]);
	let store;

	const server = setupServer(
		rest.post('/auth/reset-password', (req, res, ctx) => {
			// console.log('login() intercepted by mock api')
			return res(ctx.status(200));
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
					<ResetPasswordPage />
				</MemoryRouter>
			// </Provider>
		);
	});

	it('should show reset password form', () => {
		expect(screen.getByRole('form', { name: /Reset Password Form/i })).toBeVisible();
	});

	it('should allow name, email, password, confirm password fields to be entered', () => {
		expect(screen.getAllByRole('text').length).toBe(4)
		expect(screen.getByPlaceholderText(/example@ntu.edu.sg/i)).toBeEnabled();
		expect(screen.getByPlaceholderText(/Enter code from email/i)).toBeEnabled();
		expect(screen.getByPlaceholderText("Password")).toBeEnabled();
		expect(screen.getByPlaceholderText(/enter password again/i)).toBeEnabled();
	});


	it('should display error messages if fields are empty but button is clicked', async () => {
		act(() => {
			fireEvent.submit(screen.getByRole('button', { name: /Reset password Button/i }))
		});

		expect(await screen.findAllByRole("alert")).toHaveLength(4);
		expect(screen.getByPlaceholderText(/example@ntu.edu.sg/i)).toBeVisible();
		expect(screen.getByPlaceholderText(/Enter code from email/i)).toBeVisible();
		expect(screen.getByPlaceholderText("Password")).toBeVisible();
		expect(screen.getByPlaceholderText(/enter password again/i)).toBeVisible();
	});


	it('should check email format', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);

		await act(async () => {
			fireEvent.input(emailInput, { target: { value: "goodcatgonebad@" }});
			await fireEvent.submit(screen.getByRole('button', { name: /Reset Password Button/i }))
		});

		await waitFor(() => {
			expect(screen.queryByText(/Invalid email address!/i)).not.toBeNull();
		});
	});


	it('should disallow form submission if passwords don\'t match', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);
		const codeInput = screen.getByPlaceholderText(/Enter code from email/i);
		const passwordInput = screen.getByPlaceholderText("Password");
		const confirmPwdInput = screen.getByPlaceholderText(/enter password again/i);

		await act(async () => {
			fireEvent.input(codeInput, {
				target: { value: "1996" }
			}
			);
			fireEvent.input(emailInput, {
				target: { value: "coldplay@ntu.edu.sg" }
			}
			);

			fireEvent.input(passwordInput, {
				target: { value: "chris,johnny,guy,will,phil" }
			}
			);

			fireEvent.input(confirmPwdInput, {
				target: { value: "Q84ULk8xvPo" }
			}
			);

			await fireEvent.submit(screen.getByRole('button', { name: /Reset Password Button/i }))

		});

		await waitFor(() => {
			expect(screen.queryByText(/Code field is empty/i)).toBeNull();
			expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
			expect(screen.queryByText(/Password field is empty!/i)).toBeNull();
			expect(screen.queryByText(/The passwords do not match/i)).not.toBeNull();
		});
	});


	it('should allow form submission and navigates on successful form submission', async () => {
		const codeInput = screen.getByPlaceholderText(/Enter code from email/i);
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);
		const passwordInput = screen.getByPlaceholderText("Password");
		const confirmPwdInput = screen.getByPlaceholderText(/enter password again/i);

		await act(async () => {
			fireEvent.input(codeInput, {
				target: { value: "1996" }
			}
			);
			fireEvent.input(emailInput, {
				target: { value: "OdieIsStupid@ntu.edu.sg" }
			}
			);

			fireEvent.input(passwordInput, {
				target: { value: "StupiddHumans98*&" }
			}
			);

			fireEvent.input(confirmPwdInput, {
				target: { value: "StupiddHumans98*&" }
			}
			);

			await fireEvent.submit(screen.getByRole('button', { name: /Reset Password Button/i }))

		});

		await waitFor(() => {
			expect(codeInput).toHaveValue("1996");
			expect(emailInput).toHaveValue("OdieIsStupid@ntu.edu.sg");
			expect(passwordInput).toHaveValue("StupiddHumans98*&");
			expect(confirmPwdInput).toHaveValue("StupiddHumans98*&");

			expect(screen.queryByText(/Code field is empty/i)).toBeNull();
			expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
			expect(screen.queryByText(/Password field is empty!/i)).toBeNull();
			expect(screen.queryByText(/The passwords do not match/i)).toBeNull();
		});
	});
});