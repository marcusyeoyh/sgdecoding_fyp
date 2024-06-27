import { Dispatch } from "redux";
import { findOneUser, loginOneUser, registerOneUser } from "../../api/auth-api";
import { OAuthUserLoginModel, UserLoginModel } from "../../models/user-authentication.model";
import { AuthAction } from "../actions-types/auth-actions.types";
import { AuthTypes } from '../types/index';
import { sendChangeNameRequest } from './../../api/auth-api';
import { UserChangeName, NewUserRegistration } from './../../models/user-authentication.model';


export const login = (userCreds: UserLoginModel) => {
	return async (dispatch: Dispatch) => {
		if (userCreds.rmbMe) {
			let rmbMe: AuthAction = {
				type: AuthTypes.RMB_ME,
				rmbMeEmail: userCreds.email
			};
			dispatch(rmbMe);
		}

		try {
			const { data } = await loginOneUser(userCreds);
			console.log("Login with email and password");
			console.log(data)
			let loginSuccess: AuthAction = {
				type: AuthTypes.LOGIN_SUCCESS,
				token: data.accessToken,
				lastLogin: data.lastLogin
			};
			dispatch(loginSuccess);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};

export const loginWithOAuth = (userCreds: OAuthUserLoginModel) => {
	return async (dispatch: Dispatch) => {
		if (userCreds.rmbMe) {
			let rmbMe: AuthAction = {
				type: AuthTypes.RMB_ME,
				rmbMeEmail: userCreds.email
			};
			dispatch(rmbMe);
		}

		console.log('Register the new user');
		const newUser: NewUserRegistration = {
			email: userCreds.email,
			name: userCreds.name,
			password: "12345678@!"
		};
		await registerOneUser(newUser)
			.then((res) => {
				// console.log("[DEBUG] Registration Successful") 
				// console.log(res);
				let loginSuccess: AuthAction = {
					type: AuthTypes.LOGIN_SUCCESS,
					token: userCreds.token,
					lastLogin: new Date()
				};
				dispatch(loginSuccess);
				return Promise.resolve();
			})
			.catch(function (error) {
				if (error.response) {
					console.log(error.response.data);
					console.log(error.response.status);
					if (error.response.status == '422') {
						let loginSuccess: AuthAction = {
							type: AuthTypes.LOGIN_SUCCESS,
							token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haS52bHlAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJuYW1lIjoiTHkgVnUiLCJ0eXBlIjoibWVhZG93OSIsImlhdCI6MTcxOTM2NjA3MSwibmJmIjoxNzE5MzY2MDcxLCJleHAiOjE3MjE5NTgwNzEsImlzcyI6Imh0dHBzOi8vZ2F0ZXdheS5zcGVlY2hsYWIuc2ciLCJzdWIiOiI1ZjM0ZTM1NWJkZDg4ZDAwMjlmMWQ4YTEifQ.qzTTtLqMv3b0mUaFE_IYkn_wHfGtvQnEhLyRm5urpkBZ-welER4qRgTnlG6ZWf1Ao7rOEwORtfHArER7ewu5H4JX66oj3HPaA-C-Yh2fYnVCRzsMQqrZqqLdg5hZSjJiF0-4C_xYqpto9gJziPWF5V-oOC_Ic7ZBkjSWRqDifErEhnvMgCCY2lYZPuvw4s2WMLu3IGSF0_DsZIv7hISHjTm_dJOsvKMK0LVo9azlMQEeZd9sbRGsB9CB1JgVMKIFRzlg51U3O5t9NZunmnHAlBB70GNV4hpljzTWdIxa85FKaNo35r35o8QddCbEBJLEPmzuPoX5q_8VYlgoZzWBUg",
							lastLogin: new Date()
						};

						dispatch(loginSuccess);
						return Promise.resolve();
					} else {
						return Promise.reject();
					}
				}
				return Promise.reject();
			});
	};
};

export const changeName = (newNameRequest: UserChangeName) => {
	return async (dispatch: Dispatch) => {
		if (!newNameRequest) {
			throw new Error("New Name Request is empty!");
		}
		await sendChangeNameRequest(newNameRequest)
			.then((res) => {
				console.log(res);
				let changeNameSuccess: AuthAction = {
					type: AuthTypes.SET_NEW_NAME,
					newName: newNameRequest.newName
				};
				dispatch(changeNameSuccess);
				return Promise.resolve();
			}
			).catch((err) => {
				console.log(err);
				return Promise.reject();
			});

	};
};

// export const register = (newUser: UserRegisterModel) => {
// 	return async (dispatch: Dispatch) => {
// 		console.log("[DEBUG] register action creator")

// 		await registerOneUser(newUser)
// 			.then(({data}) => {
// 				console.log("[DEBUG] Registration Successful") 
// 				console.log(data)

// 				return Promise.resolve()
// 			})
// 			.catch((error) => {
// 				console.log(error)
// 				return Promise.reject()
// 			})

// 	}
// }

export const logout = () => {
	return (dispatch: Dispatch) => {
		dispatch({ type: AuthTypes.DELETE_TOKEN });
	};
};


export const setUserSubscriptionEnded = (hasEnded: boolean) => {
	return (dispatch: Dispatch) => {
		dispatch({ type: AuthTypes.SUBSCRIPTION_ENDED, hasEnded });
	};
};