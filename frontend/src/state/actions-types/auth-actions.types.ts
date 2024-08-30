import { AuthTypes } from '../types/index';

interface RememberMeAction {
	type: AuthTypes.RMB_ME,
	rmbMeEmail: string
}

interface LoginSuccessAction {
	type: AuthTypes.LOGIN_SUCCESS,
	token: string,
	lastLogin: Date
}


interface DeleteTokenAction {
	type: AuthTypes.DELETE_TOKEN,
}

interface ChangeNameSuccessAction {
	type: AuthTypes.SET_NEW_NAME,
	newName: string
}

interface SetUserSubscriptionEndedAction {
	type: AuthTypes.SUBSCRIPTION_ENDED,
	hasEnded: boolean
}


export type AuthAction = RememberMeAction | LoginSuccessAction 
						| ChangeNameSuccessAction | DeleteTokenAction
						| SetUserSubscriptionEndedAction;