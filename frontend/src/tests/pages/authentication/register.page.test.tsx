import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import RegisterPage from '../../../pages/authentication/register.page';


describe('On Register Page Load', () => {
	const initialState = { authReducer: { rmbMeEmail: '', token: '' } }
	const mockStore = configureStore([thunk]);
	let store;

	const server = setupServer(
		rest.post('/auth/register', (req, res, ctx) => {
			// console.log('login() intercepted by mock api')
			return res(ctx.json({ accessToken: "testToken", lastLogin: (new Date()).toString() }))
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
					<RegisterPage />
				</MemoryRouter>
			// </Provider>
		);
	});

	it('should show register form', () => {
		expect(screen.getByRole('form', { name: /Register Form/i })).toBeVisible();
	});

	it('should allow name, email, password, confirm password fields to be entered', () => {
		expect(screen.getAllByRole('text').length).toBe(4)
		expect(screen.getByPlaceholderText(/example@ntu.edu.sg/i)).toBeEnabled();
		expect(screen.getByPlaceholderText('Password')).toBeEnabled();
		expect(screen.getByPlaceholderText(/enter password again/i)).toBeEnabled();
		expect(screen.getByPlaceholderText(/John Doe/i)).toBeEnabled();
	});


	it('should display error messages if fields are empty but button is clicked', async () => {
		act(() => {
			fireEvent.submit(screen.getByRole('button', { name: /Register Button/i }))
		});

		expect(await screen.findAllByRole("alert")).toHaveLength(4);
		expect(screen.getByText(/Name field is empty/i)).toBeVisible();
		expect(screen.getByText(/Email field is empty!/i)).toBeVisible();
		expect(screen.getByText(/Password field is empty!/i)).toBeVisible();
		expect(screen.getByText(/The passwords do not match/i)).toBeVisible();
	});


	it('should check email format', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);

		await act(async () => {
			fireEvent.input(emailInput, { target: { value: "goodcatgonebad@" }});
			await fireEvent.submit(screen.getByRole('button', { name: /Register Button/i }))
		});

		await waitFor(() => {
			expect(screen.queryByText(/Invalid email address!/i)).not.toBeNull();
		});
	});


	it('should disallow form submission if passwords don\'t match', async () => {
		const nameInput = screen.getByPlaceholderText(/John Doe/i);
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);
		const passwordInput = screen.getByPlaceholderText("Password");
		const confirmPwdInput = screen.getByPlaceholderText(/enter password again/i);

		await act(async () => {
			fireEvent.input(nameInput, {
				target: { value: "Garfield" }
			}
			);
			fireEvent.input(emailInput, {
				target: { value: "OdieIsStupid@ntu.edu.sg" }
			}
			);

			fireEvent.input(passwordInput, {
				target: { value: "19june1978%^" }
			}
			);

			fireEvent.input(confirmPwdInput, {
				target: { value: "myBirthdayIs19June1978%^" }
			}
			);

			await fireEvent.submit(screen.getByRole('button', { name: /Register Button/i }))

		});

		await waitFor(() => {
			expect(screen.queryByText(/Name field is empty/i)).toBeNull();
			expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
			expect(screen.queryByText(/Password field is empty!/i)).toBeNull();
			expect(screen.queryByText(/The passwords do not match/i)).not.toBeNull();
		});
	});


	it('should allow form submission and navigates on successful registration', async () => {
		const nameInput = screen.getByPlaceholderText(/John Doe/i);
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);
		const passwordInput = screen.getByPlaceholderText("Password");
		const confirmPwdInput = screen.getByPlaceholderText(/enter password again/i);

		await act(async () => {
			fireEvent.input(nameInput, {
				target: { value: "Garfield" }
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

			await fireEvent.submit(screen.getByRole('button', { name: /Register Button/i }))

		});

		await waitFor(() => {
			expect(nameInput).toHaveValue("Garfield");
			expect(emailInput).toHaveValue("OdieIsStupid@ntu.edu.sg");
			expect(passwordInput).toHaveValue("StupiddHumans98*&");
			expect(confirmPwdInput).toHaveValue("StupiddHumans98*&");

			expect(screen.queryByText(/Name field is empty/i)).toBeNull();
			expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
			expect(screen.queryByText(/Password field is empty!/i)).toBeNull();
			expect(screen.queryByText(/The passwords do not match/i)).toBeNull();
		});
	});
});