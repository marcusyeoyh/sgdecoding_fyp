import { notesTypes } from '../types/index';
import { userNotesResponse } from "../../models/notes.model";

interface getUserSelectedNotesAction{
    type: notesTypes.GET_USER_SELECTED_NOTES,
	selectedNotes : userNotesResponse
}

interface getUserNotesAction{
	type:notesTypes.GET_USER_NOTES,
	notes: userNotesResponse[]
}

interface addTranscriptionAction{
    type:notesTypes.ADD_CURRENT_TRANSCRIPTION,
    final:string
}

interface updateNotesTextAction{
    type:notesTypes.UPDATE_NOTES,
    text:string
}

export type notesAction = getUserSelectedNotesAction
                            | getUserNotesAction
                            | addTranscriptionAction
                            | updateNotesTextAction;
