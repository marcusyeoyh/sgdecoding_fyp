import { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container, Form, InputOnChangeData, Message } from "semantic-ui-react";
import { registerOneUser } from "../../api/auth-api";
import { NewUserRegistration, NewUserRegistrationResponse } from "../../models/user-authentication.model";
import { RootState } from "../../state/reducers";
import authModStyles from './authentication.module.scss';

const RegisterPage: React.FC = () => {
	/* Declarations */
	const [regMessage, setRegMessage] = useState({ isShown: false, isError: false, msg: '' });
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm({ mode: 'onBlur' });
	const password = useRef({});
	password.current = watch('password', '');

	const { token } = useSelector((state: RootState) => state.authReducer);
	const isLoggedIn = token !== '';
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		register('name', {
			required: 'Name field is empty!',
			minLength: {
				value: 2,
				message: 'Minimum length is 2'
			},
			maxLength: {
				value: 100,
				message: 'You have exceeded the maximum length 100'
			},
		});
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
		register("passwordCfm", {
			validate: v => v === password.current || 'The passwords do not match'
		});

		// if (isLoggedIn)
		// 	navigate('/');

	}, [isLoggedIn, navigate, register]);


	/* Event Handlers */
	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		// setValue(name, value, { shouldValidate: true})
		setValue(name, value);
	};

	const onInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValue(name, value, { shouldValidate: true });
	};

	const onSubmit = async (data: { email: string, name: string, password: string, passwordCfm: string }) => {
		// console.log("[DEBUG] onSubmit: ")
		// console.log(data)
		setIsLoading(true);
		const newUser: NewUserRegistration = {
			email: data.email,
			name: data.name,
			password: data.password,
		};

		registerOneUser(newUser)
			.then((res: AxiosResponse<NewUserRegistrationResponse, any>) => {
				console.log('Successful Registration');
				let msg = res.data.user.email + ' is registered successfully. Please login to continue!';
				setRegMessage({ isShown: true, isError: false, msg: msg });
			})
			.catch((err: AxiosError) => {
				// console.log("[DEBUG] Error Registering!")
				//console.log(err.response)
				let errMsg = 'Unknown Error, please contact an administrator!';
				if (err.response?.data.statusCode === 422)
					errMsg = 'Account Already Registered!';
				setRegMessage({ isShown: true, isError: true, msg: errMsg });
			})
			.finally(()=> {
				setIsLoading(false);
			});
	};

	//template
	return (
		<Card.Content>
			<Container className={authModStyles.cardHeader}>
				<h1>Register a New Account</h1>
				<small>Join us today by creating a new account!</small>
				<div id={authModStyles.blockDivider}></div>
			</Container>

			<Form
				onSubmit={handleSubmit(onSubmit as any)}
				// {...regMessage.isError ? 'error' : 'positive' }
				error={regMessage.isShown && regMessage.isError}
				noValidate
				role="form"
				aria-label="Register Form"
				>
				<Message
					hidden={regMessage.isShown === false}
					error={regMessage.isError === true}
					positive={regMessage.isError === false}
					header= {regMessage.isError ? 'Registration Unsuccessful' : 'Registration Successful'}
					content={regMessage.msg}
				/>
				<Form.Field>
					<Form.Input
						name='name'
						label='Your Full Name'
						fluid
						type='text'
						placeholder='John Doe'
						onChange={onInputChange}
						onBlur={onInputBlur}
						error={errors.name ? { content: errors.name.message } : false}
						role="text"
						aria-label="Full Name Input"
					/>
				</Form.Field>
				<Form.Field>
					<Form.Input
						name='email'
						label='Email'
						fluid
						type='email'
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
						placeholder='Password'
						onChange={onInputChange}
						onBlur={onInputBlur}
						error={errors.password ? { content: errors.password.message } : false}
						role="text"
						aria-label="Password Input"
					/>
				</Form.Field>
				<Form.Field>
					<Form.Input
						fluid
						label="Confirm Password"
						name="passwordCfm"
						type='password'
						placeholder='Enter password again'
						onChange={onInputChange}
						onBlur={onInputBlur}
						error={errors.passwordCfm ? { content: errors.passwordCfm.message } : false}
						role="text"
						aria-label="Confirm Password Input"
					/>
				</Form.Field>
				<Button
					className={authModStyles.mainActionBtn}
					// fluid
					primary
					icon={isLoading ? 'spinner' : null}
					loading={isLoading}
					type='submit'
					content='Register'
					role='button'
					aria-label='Register Button'
					/>

				<Button
					className={authModStyles.goBackBtn}
					basic
					onClick={() => navigate(-1)}>
					Go Back
				</Button>

			</Form>

		</Card.Content>
	);
};

export default RegisterPage;