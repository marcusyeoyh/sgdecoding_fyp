import jwtDecode, { JwtPayload } from 'jwt-decode';
import { Token } from '../../models/access-token.model';
import { AuthAction } from '../actions-types/auth-actions.types';
import { AuthTypes } from '../types/index';

export const INITIAL_STATE = {
	token : '',
	rmbMeEmail: '',
	exp: new Date(),
	name: '',
	role: '',
	type: '',
	sub: '',
	email:'',
	// logoutMsg: '',
	lastLogin: new Date(),
	hasSubEnded: false
};

const reducer = (state = INITIAL_STATE, action: AuthAction) => {
	switch (action.type) {
		case AuthTypes.RMB_ME:
			const { rmbMeEmail } = action;
			return {...state, rmbMeEmail };

		case AuthTypes.LOGIN_SUCCESS:
			const { token, lastLogin } = action;
			 //TODO : remove type
			const { exp, name, role, sub, email, type } = jwtDecode<JwtPayload>(token) as Token;
			return { ...state, token, exp: new Date(exp * 1000), name, role, sub, email, type, lastLogin };

		case AuthTypes.SET_NEW_NAME:
			const { newName } = action;
			return { ...state, name: newName };

		case AuthTypes.DELETE_TOKEN:
			return { ...state, token: ''};

		case AuthTypes.SUBSCRIPTION_ENDED:
			return {...state, hasSubEnded: action.hasEnded };

		default:
			return state;
	}
};

export default reducer;