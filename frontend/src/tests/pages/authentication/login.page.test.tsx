import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import LoginPage from '../../../pages/authentication/login.page';

// How to mock redux store
// https://stackoverflow.com/a/70149004/2466342

const mockedUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom') as any,
	useNavigate: () => mockedUseNavigate,
}));

describe('On Component Initialisation', () => {
	const initialState = { authReducer: { rmbMeEmail: '', token: '' } }
	const mockStore = configureStore([thunk]);
	let store;

	const server = setupServer(
		rest.post('/auth/login', (req, res, ctx) => {
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
					<LoginPage />
				</MemoryRouter>
			// </Provider>
		);
	});


	it('should show login form', () => {
		expect(screen.getByRole('form', { name: /Login Form/i })).toBeVisible();
	});

	it('should allow email and password fields to be entered', () => {
		expect(screen.getAllByRole('text').length).toBe(2)
		expect(screen.getByPlaceholderText(/example@ntu.edu.sg/i)).toBeEnabled();
		expect(screen.getByPlaceholderText(/Enter your password/i)).toBeEnabled();
	});

	it('should not display error messages when component is loaded', async () => {
		expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
		expect(screen.queryByText(/Password field is empty!/i)).toBeNull();
	});

	it('should display error messages if fields are empty but button is clicked', async () => {
		act(() => {
			fireEvent.submit(screen.getByRole('button', { name: /Login Button/i }))
		});

		expect(await screen.findAllByRole("alert")).toHaveLength(2);
		expect(screen.getByText("Email field is empty!")).toBeVisible();
		expect(screen.getByText(/Password field is empty!/i)).toBeVisible();

	});

	it('should check email format', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);

		await act(async () => {
			fireEvent.input(emailInput, { target: { value: "goodcatgonebad@" }});
			await fireEvent.submit(screen.getByRole('button', { name: /Login Button/i }))
		});

		await waitFor(() => {
			expect(screen.queryByText(/Invalid email address!/i)).not.toBeNull();
		});
	});

	it('should check password length', async () => {
		const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

		await act(async () => {
			fireEvent.input(passwordInput, { target: { value: "test" }});
			await fireEvent.submit(screen.getByRole('button', { name: /Login Button/i }))
		});

		await waitFor(() => {
			expect(screen.queryByText(/Password is too short!/i)).not.toBeNull();
		});
	});

	it('should allow form submission and navigates on successful login', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);
		const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

		await act(async () => {
			fireEvent.input(emailInput, {
				target: { value: "fatorangecat@ntu.edu.sg" }
			}
			);

			fireEvent.input(passwordInput, {
				target: { value: "lasagnaP@rad1se" }
			}
			);

			await fireEvent.submit(screen.getByRole('button', { name: /Login Button/i }))

		});

		await waitFor(() => {
			expect(emailInput).toHaveValue("fatorangecat@ntu.edu.sg");
			expect(passwordInput).toHaveValue("lasagnaP@rad1se");

			expect(screen.queryByText(/Email field is empty!/i)).toBeNull();
			expect(screen.queryByText(/Password field is empty!/i)).toBeNull();

			expect(mockedUseNavigate).toHaveBeenCalledWith('/');
		});
	});

	it('should display error if login credentials are invalid', async () => {
		const emailInput = screen.getByPlaceholderText(/example@ntu.edu.sg/i);
		const passwordInput = screen.getByPlaceholderText(/Enter your password/i);

		server.use(
			rest.post('/auth/login', (req, res, ctx) => {
				// console.log('login() intercepted by mock api')
				return res(ctx.status(403));
			}),
		)

		await act(async () => {
			fireEvent.input(emailInput, {
				target: { value: "badasscat@ntu.edu.sg" }
			}
			);

			fireEvent.input(passwordInput, {
				target: { value: "OdieIsStupid,Cat>Dog" }
			}
			);

			await fireEvent.submit(screen.getByRole('button', { name: /Login Button/i }))

		});

		await waitFor(() => {

			expect(mockedUseNavigate).not.toHaveBeenCalledWith('/');
			
			// Error Message should display
			expect(screen.getByText('Login Unsuccessful')).toBeVisible();
		});
	});


});