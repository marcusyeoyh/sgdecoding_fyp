import { notesTypes } from "../types/index";
import { notesAction } from '../actions-types/notes-actions.types';
import { userNotesResponse } from "../../models/notes.model";

interface notesState {
	notes: userNotesResponse[],
    selectedNotes: userNotesResponse | undefined
}

export const INITIAL_STATE: notesState = {
	notes: [],
	selectedNotes: undefined,
};

const reducer = (state = INITIAL_STATE, action: notesAction ) : notesState=> {
	switch (action.type) {
		case notesTypes.GET_USER_NOTES:
            const { notes } = action;
			return {...state, notes};
        case notesTypes.GET_USER_SELECTED_NOTES:
            const { selectedNotes } = action;
            return {...state, selectedNotes};
        case notesTypes.ADD_CURRENT_TRANSCRIPTION:
            const {final} = action;
            return {...state, selectedNotes:{ ...state.selectedNotes,text: final}};
        case notesTypes.UPDATE_NOTES:
            const {text} = action;
            return {...state, selectedNotes:{ ...state.selectedNotes,text: text}};
        default:
			return state;
	}
};

export default reducer;