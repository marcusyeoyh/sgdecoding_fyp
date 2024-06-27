export interface UserChangeName {
	token: string,
	newName: string
}

export interface UserChangeNameResponse {
	message: string,
	statusCode: number,
	error: string
}

export interface UserChangePassword {
	email: string,
	currentPassword: string,
	newPassword: string,
	confirmNewPassword: string
}

export interface UserChangePasswordResponse {
	message: string,
	statusCode: number,
	error: string
}

export interface UserLoginModel {
	email: string,
	password: string,
	rmbMe: boolean
}

export interface OAuthUserLoginModel {
	email: string,
	name: string,
	token: string,
	rmbMe: boolean
}


export interface NewUserRegistration {
	name: string,
	email: string,
	password: string
}

export interface NewUserRegistrationResponse {
	message: string,
	user: {
		createdAt: string,
		email: string,
		name: string,
		role: string,
		_id: string
	}
}

export interface UserResetPassword {
	email: string,
	code: string,
	newPassword: string,
	confirmNewPassword: string
}

export interface UserResetPasswordResponse {
	message: string,
	statusCode: number,
	error: string
}