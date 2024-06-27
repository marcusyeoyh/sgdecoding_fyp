import { Dispatch } from "redux";
import { createSharedNotes, getSharedNotes,deleteSharedNotes } from "../../api/shared-notes-api";
import { notesAction } from "../actions-types/notes-actions.types";
import { notesTypes } from '../types/index';

export const createOneSharedNotes = (userEmail: string, notesId: string) => {
    return async (dispatch: Dispatch) => {
		try {
			await createSharedNotes(userEmail,notesId);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject();
		}
	};
};


export const getAllSharedNotes = (userEmail: string) => {
	console.log("here");
	return async (dispatch: Dispatch) => {
		console.log("here1");
		try {
			const { data } = await getSharedNotes(userEmail);
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

export const deleteSelectedSharedNotes = (id: string, userEmail: string) => {
	return async (dispatch: Dispatch) => {
		try {
			await deleteSharedNotes(id,userEmail);
			const { data } = await getSharedNotes(userEmail);
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
