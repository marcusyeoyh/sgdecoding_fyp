import { NewUserRegistration, UserChangeName, UserChangePassword, UserLoginModel, UserResetPassword } from '../models/user-authentication.model';
import { proxyAPI } from './api';

export const loginOneUser = (userCreds: UserLoginModel) => {
	return proxyAPI.post(
		`/auth/login`, 
		{ email: userCreds.email, password: userCreds.password }
	);
};

export const findOneUser = (userEmail : string) => {
	return proxyAPI.post(
		`/auth/find-user`,
		{ email: userEmail },
		{ responseType: 'json' }
	);
};

export const registerOneUser = (newUser: NewUserRegistration) => {
	return proxyAPI.post(
		`/auth/register`,
		{ name: newUser.name, email: newUser.email, password: newUser.password },
		{ responseType: 'json' }
	);
};

export const sendForgotPasswordRequest = (email: string) => {
	return proxyAPI.post(
		`/auth/forgot-password`,
		{ email },
		{ responseType: 'json'}
	);
};

export const sendResetPasswordRequest = (newPasswordRequest: UserResetPassword) => {
	return proxyAPI.post(
		`/auth/reset-password`,
		newPasswordRequest,
		{responseType: 'json'}
	);
};

export const sendChangePasswordRequest = (newPasswordRequest: UserChangePassword) => {
	return proxyAPI.post(
		`/auth/change-password`,
		newPasswordRequest,
		{responseType: 'json'}	
	);
};

export const sendChangeNameRequest = (newNameRequest: UserChangeName) => {
	return proxyAPI.post(
		`/users/change-name`,
		newNameRequest,
		{responseType: 'json'}	
	);
};

export const getStatistics = (userID: string) => {
	return proxyAPI.post(
		`/users/statistics`,
		{ userID },
		{responseType: 'json'}
	);
};
