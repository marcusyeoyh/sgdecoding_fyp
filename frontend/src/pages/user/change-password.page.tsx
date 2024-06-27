import { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Button, Card, Container, Form, Header, InputOnChangeData, Message } from 'semantic-ui-react';
import { sendChangePasswordRequest } from '../../api/auth-api';
import { UserChangePassword, UserChangePasswordResponse } from '../../models/user-authentication.model';
import { actionCreators } from '../../state';
import { RootState } from '../../state/reducers';
import styles from './change-password.module.scss';

const ChangePasswordPage: React.FC = () => {
	/* Declarations */
	const [formMessage, setFormMessage] = useState({ isShown: false, isError: false, msg: '' });
	const [isLoading, setIsLoading] = useState(false);
	// const [isDisabled, setIsDiabled] = useState(false)
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors }
	} = useForm({ mode: 'onBlur' });
	
	const newPassword = useRef({});
	newPassword.current = watch('newPassword', '');

	const { token, email } = useSelector((state: RootState) => state.authReducer);
	const isLoggedIn = token !== '';
	const dispatch = useDispatch();
	const { logout } = bindActionCreators(actionCreators, dispatch);

	useEffect(() => {
		register("currentPassword", {
			required: 'Password field is empty!',
		});
		register("newPassword", {
			required: 'Password field is empty!',
			minLength: {
				value: 6,
				message: 'Password is too short!'
			}
		});
		register("passwordCfm", {
			validate: v => v === newPassword.current || 'The passwords do not match'
		});

		if (!isLoggedIn)
			navigate('/');

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

	const onSubmit = async (data: { currentPassword: string, newPassword: string, passwordCfm: string }) => {
		setIsLoading(true);
		
		// console.log("[DEBUG] onSubmit: ")
		// console.log(data)

		const newPasswordRequest: UserChangePassword = {
			email: email,
			currentPassword: data.currentPassword,
			newPassword: data.newPassword,
			confirmNewPassword: data.passwordCfm,
		};

		sendChangePasswordRequest(newPasswordRequest)
			.then((res: AxiosResponse<UserChangePasswordResponse, any>) => {
				// console.log("[DEBUG] Successful Reset") 
				setIsLoading(false);
				// setFormMessage({ isShown: true, isError: false, msg: res.data.message });
				console.log("Successfully changed password!");
				navigate('/auth/login?logoutMsg=' + "Password changed successfully, please log in again!");
				logout();
			})
			.catch((err: AxiosError) => {
				// console.log("[DEBUG] Error Resetting!")
				// console.log(err.response)
				setIsLoading(false);
				setFormMessage({ isShown: true, isError: true, msg: err.message });
			});
	};

	//template
	return (
		<Card.Content id={styles.changePwdContainer}>
			<Container>
				<Header as="h1">Change Password</Header>
			</Container>

			<Form
				onSubmit={handleSubmit(onSubmit as any)}
				// {...formMessage.isError ? 'error' : 'positive' }
				error={formMessage.isShown && formMessage.isError}
				aria-label="Change Password Form"
				noValidate>
				<Message
					hidden={formMessage.isShown === false}
					error={formMessage.isError === true}
					positive={formMessage.isError === false}
					header= {formMessage.isError ? 'Change Password Unsuccessful' : 'Change Password Successful'}
					content={formMessage.msg}
				/>
				<Form.Field>
					<Form.Input
						fluid
						label="Current Password"
						name="currentPassword"
						type='password'
						placeholder='Enter current password'
						onChange={onInputChange}
						onBlur={onInputBlur}
						// disabled={isDisabled}
						error={errors.currentPassword ? { content: errors.currentPassword.message } : false}
						role="text"
						aria-label="Current Password Input"
					/>
				</Form.Field>
				<Form.Field>
					<Form.Input
						fluid
						label="New Password"
						name="newPassword"
						type='password'
						placeholder='Enter new password'
						onChange={onInputChange}
						onBlur={onInputBlur}
						role="text"
						aria-label="new password input"
						// disabled={isDisabled}
						error={errors.newPassword ? { content: errors.newPassword.message } : false}
					/>
				</Form.Field>
				<Form.Field>
					<Form.Input
						fluid
						label="Confirm Password"
						name="passwordCfm"
						type='password'
						placeholder='Enter new password again'
						onChange={onInputChange}
						onBlur={onInputBlur}
						role="text"
						aria-label="confirm password input"
						// disabled={isDisabled}
						error={errors.passwordCfm ? { content: errors.passwordCfm.message } : false}
					/>
				</Form.Field>
				
				<Button
					id={styles.submitBtn}
					fluid
					primary
					icon={isLoading ? "spinner": null}
					loading={isLoading}
					type='submit'
					content="Change My Password"
					>
					
				</Button>

				<Button
					id={styles.goBackBtn}
					fluid
					basic
					onClick={() => navigate(-1)}>
					Go Back
				</Button>

			</Form>

		</Card.Content>
	);
};

export default ChangePasswordPage;