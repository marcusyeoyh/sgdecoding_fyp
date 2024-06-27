import React, { FormEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Button, Card, Checkbox, CheckboxProps, Container, Form, Header, Image, InputOnChangeData, Message } from 'semantic-ui-react';
import { GridColumn, Divider, Grid, Segment, Icon } from 'semantic-ui-react'
import { UserLoginModel, OAuthUserLoginModel } from '../../models/user-authentication.model';
import { actionCreators } from '../../state';
import { RootState } from '../../state/reducers';
import authModStyles from './authentication.module.scss';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginPage: React.FC = () => {
	/* Declarations */
	const [showError, setShowError] = useState(false);
	const [showNoUserFound,setShowNoUserFound] = useState(false);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm({ mode: 'onBlur' });

	const { rmbMeEmail, token } = useSelector((state: RootState) => state.authReducer);
	const isLoggedIn = token !== '';
	const [isLoading, setIsLoading] = useState(false);

	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [searchParams, setSearchParams] = useSearchParams();
	const logoutMsg = searchParams.get('logoutMsg');

	const dispatch = useDispatch();
	const { login } = bindActionCreators(actionCreators, dispatch);
	const { loginWithOAuth } = bindActionCreators(actionCreators, dispatch);

	const gglogin = useGoogleLogin({
		onSuccess: async tokenResponse => {
			const token = tokenResponse.access_token;
		  	// fetching userinfo can be done on the client or the server
			const userInfo = await axios
				.get('https://www.googleapis.com/oauth2/v3/userinfo', 
				{ headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
				})
			const result = userInfo.data;
			console.log(result);
			// contains name, email & googleId(sub)
			setSearchParams({logoutMsg:""});
			setShowError(false);
			setShowNoUserFound(false);
			setIsLoading(true);
			if (result.email && result.name) {
				const userCreds: OAuthUserLoginModel = {
					email: result.email,
					name: result.name,
					token: token,
					rmbMe: false
				};
				try {
					await loginWithOAuth(userCreds);
					console.log('loading successful');
					setIsLoading(false);
					navigate('/');
				} catch (err) {
					console.log("[DEBUG] Error logging in!");
					console.log(err)
					setIsLoading(false);
					setShowError(true);
				}
			}
		},
	  });

	useEffect(() => {
		register("email", {
			required: 'Email field is empty!',
			pattern: {
				value: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
				message: 'Invalid email address!'
			}
		});
		register("password", {
			required: 'Password field is empty!',
			minLength: {
				value: 6,
				message: 'Password is too short!'
			}
		});
		register('rmbMe');

		if (rmbMeEmail !== '') {
			setValue('rmbMe', true);
		}
	}, [register]);


	/* Event Handlers */
	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		//setValue(name, value, { shouldValidate: true})
		setValue(name, value);
	};

	const onInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValue(name, value, { shouldValidate: true });
	};

	const onRmbMeChange = (e: FormEvent<HTMLInputElement>, data: CheckboxProps) => {
		setValue('rmbMe', data.checked);
	};

	const onSubmit = async (data: { email: string, password: string, rmbMe: undefined | boolean }) => {
		setSearchParams({logoutMsg:""});
		setShowError(false);
		setShowNoUserFound(false);
		setIsLoading(true);
		if (data.email && data.password) {
			const userCreds: UserLoginModel = {
				email: data.email,
				password: data.password,
				rmbMe: data.rmbMe === undefined ? false : true
			};
			console.log("Login details");
			console.log(userCreds);
			try {
				await login(userCreds);
				console.log('loading successful');
				setIsLoading(false);
				navigate('/');
			} catch (err) {
				console.log("[DEBUG] Error logging in!");
				setIsLoading(false);
				setShowError(true);
			}
		}
	};

	return (
		<Card.Content>
			<Container className={authModStyles.cardHeader}>
				<Image src="/images/Main_logo.svg" alt="sg decoding logo" />
				<Header as="h1">Welcome to SGDecoding</Header>
				<small>Sign in to continue</small>
				<div id={authModStyles.blockDivider}></div>
			</Container>
			<Message
				positive
				header="You are Logged Out!"
				content={logoutMsg}
				hidden={logoutMsg === "" || logoutMsg === null}
			/>

			{showNoUserFound &&
				<Message
				header='No User Found'
				content='We cannot find the user you had entered in our records. Please proceed to Register for an account.'
				/>
			}
			<Form
				onSubmit={handleSubmit(onSubmit as any)}
				error={showError}
				noValidate
				role="form"
				aria-label="Login Form"
			>
				<Message
					error
					header='Login Unsuccessful'
					content='We cannot find the email and/or password that you had entered in our records. Please check and try again.'
				/>
				
				<Form.Field>
					<Form.Input
						name='email'
						label='Email'
						fluid
						type='email'
						//defaultValue={rmbMeEmail}
						placeholder='example@ntu.edu.sg'
						onChange={onInputChange}
						onBlur={onInputBlur}
						error={errors.email ? { content: errors.email.message } : false}
						role="text"
						aria-label="Email Input"
					/>
				</Form.Field>
				<Form.Field>
					<Form.Input
						fluid
						label="Password"
						name="password"
						type='password'
						placeholder='Enter your password'
						onChange={onInputChange}
						onBlur={onInputBlur}
						error={errors.password ? { content: errors.password.message } : false}
						role="text"
						aria-label="Password Input"
					/>
				</Form.Field>

				<Form.Field>
					<Checkbox
						name="rmbMe"
						label='Remember Me?'
						onChange={onRmbMeChange}
						defaultChecked={rmbMeEmail !== ''}
					/>
				</Form.Field>
				<Segment>
					<Grid columns={2} relaxed='very'>
						<GridColumn>
						<Button
							// fluid
							className={authModStyles.mainActionShortBtn}
							primary
							icon={isLoading ? "spinner" : undefined}
							loading={isLoading}
							content="Login"
							type='submit'
							role='button'
							aria-label='Login Button'
						/>
						</GridColumn>
						<GridColumn>
							<Button className={authModStyles.mainActionShortBtn} basic color='red' >Login with Google
							</Button>

							{/* <Button className={authModStyles.mainActionShortBtn} basic color='red' 
									onClick={() => gglogin()}>Login with Google
							</Button> */}
						</GridColumn>
					</Grid>
					<Divider vertical>Or</Divider>
				</Segment>
			</Form>
			<Link
				to='/auth/forgotpassword'
				id={authModStyles.forgotPasswordLink}
			>
				<em>Forgot your password?</em>
			</Link>
			<h4>Don't have an account?
				<em><Link to='/auth/register'> Register here</Link></em>
			</h4>
			<Link
				to='/privacy'
				id={authModStyles.privacyAndTermsLink}
			>
				<em>Privacy</em>
			</Link>
			{'  •  '}
			<Link
				to='/terms'
				id={authModStyles.privacyAndTermsLink}
			>
				<em>Terms and Conditions</em>
			</Link>
		</Card.Content>);
};

export default LoginPage;