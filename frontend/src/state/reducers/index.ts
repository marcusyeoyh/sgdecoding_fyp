import { combineReducers } from "redux";
import { AuthAction } from "../actions-types/auth-actions.types";
import { AuthTypes } from './../types/index';
import authReducer from "./auth-reducer";
import navbarReducer from "./navbar-reducer";
import liveTranscribeReducer from "./liveTranscribe-reducer";
import transcriptionHistoryReducer from './transcription-history-reducer';
import notesReducer from './notes-reducer';

// Combine all reducers into single object
const reducers = combineReducers({
	liveTranscribeReducer,
	authReducer,
	transcriptionHistoryReducer,
	navbarReducer,
	notesReducer,
});

const rootReducer = (state: any, action:AuthAction) => {
	if(action.type === AuthTypes.DELETE_TOKEN){
		localStorage.removeItem('authReducer');
		localStorage.removeItem('_persist');
		return reducers(undefined, action);
	}

	return reducers(state, action);
};

export default rootReducer;

export type RootState = ReturnType<typeof reducers>;