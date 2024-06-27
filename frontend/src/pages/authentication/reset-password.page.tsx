import { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Container, Form, InputOnChangeData, Message } from 'semantic-ui-react';
import { sendResetPasswordRequest } from '../../api/auth-api';
import { UserResetPassword, UserResetPasswordResponse } from '../../models/user-authentication.model';
import { RootState } from '../../state/reducers';
import classes from './authentication.module.scss';

const ResetPasswordPage: React.FC = () => {
	/* Declarations */
	const [formMessage, setFormMessage] = useState({ isShown: false, isError: false, msg: '' });
	// const [isDisabled, setIsDiabled] = useState(false);

	const {search} = useLocation();
	const code = new URLSearchParams(search).get('code')!;
	const email = new URLSearchParams(search).get('email')!;
	// console.log("[DEBUG] " + code) 
	// console.log("[DEBUG] " + email)

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

	useEffect(() => {
		register("email", {
			required: 'Email field is empty!',
			pattern: {
				value: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
				message: 'Invalid email address!'
			}
		});

		register("code", {
			required: 'Code field is empty!'
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

		if (isLoggedIn)
			navigate('/');

		// if(email === null || code === null){
		// 	setFormMessage({isShown: true, isError: true, msg: 'Invalid Reset Password Link!'})
		// 	setIsDiabled(true)
		// }
	}, [isLoggedIn, navigate, register, email, code]);


	/* Event Handlers */
	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, { name, value }: InputOnChangeData) => {
		// setValue(name, value, { shouldValidate: true})
		setValue(name, value);
	};

	const onInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValue(name, value, { shouldValidate: true });
	};

	const onSubmit = async (data: { email: string, code: string, password: string, passwordCfm: string }) => {
		// console.log("[DEBUG] onSubmit: ")
		// console.log(data)

		const newPasswordRequest: UserResetPassword = {
			email: data.email,
			code: data.code,
			newPassword: data.password,
			confirmNewPassword: data.passwordCfm,
		};

		sendResetPasswordRequest(newPasswordRequest)
			.then((res: AxiosResponse<UserResetPasswordResponse, any>) => {
				// console.log("[DEBUG] Successful Reset") 
				setFormMessage({ isShown: true, isError: false, msg: res.data.message });
			})
			.catch((err: AxiosError) => {
				// console.log("[DEBUG] Error Resetting!")
				// console.log(err.response)
				setFormMessage({ isShown: true, isError: true, msg: err.message });
			});
	};
	return (
		<Card.Content>
			<Container className={classes.cardHeader}>
				<h1>Reset Password</h1>
				<small>Enter your new password</small>
			</Container>

			<Form
				onSubmit={handleSubmit(onSubmit as any)}
				// {...formMessage.isError ? 'error' : 'positive' }
				error={formMessage.isShown && formMessage.isError}
				noValidate
				role="form"
				aria-label="Reset Password Form"
				>
				<Message
					hidden={formMessage.isShown === false}
					error={formMessage.isError === true}
					positive={formMessage.isError === false}
					header= {formMessage.isError ? 'Reset Password Unsuccessful' : 'Reset Password Successful'}
					content={formMessage.msg}
				/>
				<Form.Field>
					<Form.Input
						name='email'
						label='Existing Email'
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
						name='code'
						label='Code'
						fluid
						type='text'
						placeholder='Enter code from email'
						onChange={onInputChange}
						onBlur={onInputBlur}
						error={errors.code ? { content: errors.code.message } : false}
						role="text"
						aria-label="Code Input"
					/>
				</Form.Field>
				<Form.Field>
					<Form.Input
						fluid
						label="New Password"
						name="password"
						type='password'
						placeholder='Password'
						onChange={onInputChange}
						onBlur={onInputBlur}
						// disabled={isDisabled}
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
						// disabled={isDisabled}
						error={errors.passwordCfm ? { content: errors.passwordCfm.message } : false}
						role="text"
						aria-label="Confirm Password Input"
					/>
				</Form.Field>
				
				<Button
					className={classes.mainActionBtn}
					primary
					type='submit'
					role='button'
					aria-label='Reset Password Button'
					>
					Reset My Password
				</Button>

				<Button
					className={classes.goBackBtn}
					basic
					onClick={() => navigate('/auth/login')}>
					Go Back
				</Button>

			</Form>

		</Card.Content>
	);
};

export default ResetPasswordPage;