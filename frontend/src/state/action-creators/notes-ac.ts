import { Dispatch } from "redux";
import { createNotes, getNotes, getOneNote, updateNotes, updateTitle, deleteNotes, createNotesWithText } from "../../api/notes-api";
import { notesAction } from "../actions-types/notes-actions.types";
import { notesTypes } from '../types/index';

export const addTranscriptedNotes = (final: string) => {

    let addCurrentTransaction: notesAction = {
        type: notesTypes.ADD_CURRENT_TRANSCRIPTION,
        final: final
    };
    return (dispatch: Dispatch) => {
		dispatch(addCurrentTransaction);
	};
};
export const createNewNotes = (userEmail: string, title: string) => {
    
	return async (dispatch: Dispatch) => {
		try {
			await createNotes(userEmail,title);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};


export const createNewNotesWText = (userEmail: string, title: string, text: string) => {
    
	return async (dispatch: Dispatch) => {
		try {
			await createNotesWithText(userEmail,title,text);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};

export const updateNotesAPI = (id: string, text: string) => {
	return async (dispatch: Dispatch) => {
		try {

			const {data} = await updateNotes(id,text);
            console.log('updateText',data);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};

export const udpateNotesTitle = (id: string, title: string) => {
	return async (dispatch: Dispatch) => {
		try {
			console.log("title",title);
			const {data} = await updateTitle(id,title);
            console.log('updateTilte',data);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};

export const deleteSelectedNote = (id:string, userEmail:string)=>{
	return async (dispatch: Dispatch) => {
		try {
			await deleteNotes(id);
			const { data } = await getNotes(userEmail);
			let getUserNotes: notesAction = {
				type: notesTypes.GET_USER_NOTES,
				notes: data
			};
			dispatch(getUserNotes);
			// if(data==null){
			return Promise.resolve();
			// }else{
			// 	return Promise.reject();
			// }
		} catch (error) {
			return Promise.reject();
		}
	};
}
export const updateNotesState = (text: string) => {
    let updatedNotes: notesAction = {
        type: notesTypes.UPDATE_NOTES,
        text: text
    };
    return (dispatch: Dispatch) => {
		dispatch(updatedNotes);
	};
};

export const getAllNotes = (userEmail: string) => {
	return async (dispatch: Dispatch) => {
		try {
			const { data } = await getNotes(userEmail);
			let getUserNotes: notesAction = {
				type: notesTypes.GET_USER_NOTES,
				notes: data
			};
			dispatch(getUserNotes);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};

export const getUserOneNote = (noteId: string) => {
	return async (dispatch: Dispatch) => {
		try {
			const { data } = await getOneNote(noteId);
			console.log('notes data', data);
			let getUserNotes: notesAction = {
				type: notesTypes.GET_USER_SELECTED_NOTES,
				selectedNotes: data
			};
			dispatch(getUserNotes);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};