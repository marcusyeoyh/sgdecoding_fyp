
export enum TestType{
	ADD = "add",
	MINUS = "minus"
}

export enum NavbarChangeTypes{
	TOGGLE_SIDEBAR = 'togglesidebar'
}

export enum LivetranscribeTypes{
	ENDED = 'ended',
}

export enum notesTypes{
	GET_USER_NOTES="getUserNotes",
	GET_USER_SELECTED_NOTES="getUserSelectedNotes",
	ADD_CURRENT_TRANSCRIPTION="addTranscription",
	UPDATE_NOTES="updateNotes"
}

export enum AuthTypes {
	RMB_ME = 'rmbMe',
	LOGIN_SUCCESS = 'loginSuccess',
	LOGIN_FAILED = 'loginFailed',
	SUBSCRIPTION_ENDED = 'subscriptionEnded',
	DELETE_TOKEN = 'logout',
	SET_LOGOUT_MSG = 'setLogoutMsg',
	DELETE_LOGOUT_MSG = 'delLogoutMsg',
	SET_NEW_NAME = 'setnewname',
	ISADMIN = 'isAdmin'
}

export enum UserTranscriptionTypes{
	SET_THIS_USER_HISTORY = 'set_user_th',
	SET_SELECTED_TRANSCRIPTION_HISTORY = "set_selected_th",
	SET_SELECTED_TRANSCRIPTION_TEXT = 'set_selected_th_text'
}