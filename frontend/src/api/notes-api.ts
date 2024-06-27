// import { userNotesResponse  } from '../models/notes.model';
import { proxyAPI } from './api';

export const getNotes = (userEmail : string) => {
	return proxyAPI.post(
		`/notes`,
		{ userEmail: userEmail },
		{ responseType: 'json' }
	);
};

export const editNotes = (id : string) => {
	return proxyAPI.get(
		`/notes/edit/`+id
	);
};

export const createNotes = (userEmail : string, title : string) => {
	return proxyAPI.post(
		`/notes/new`,
		{ userEmail: userEmail, title: title },
		{ responseType: 'json' }
	);
};

export const createNotesWithText = (userEmail : string, title : string, text: string) => {
	console.log("createNewNotes",userEmail,title,text);
	return proxyAPI.post(
		`/notes/newNote`,
		{ userEmail: userEmail, title: title, text: text },
		{ responseType: 'json' }
	);
};

export const getOneNote = (note_id : string) => {
	return proxyAPI.post(
		`/notes/oneNote`,
		{ _id: note_id },
		{ responseType: 'json' }
	);
};

export const updateNotes = (id : string, text : string) => {
	return proxyAPI.post(
		`/notes/update`,
		{ _id: id, text: text },
		{ responseType: 'json' }
	);
};

export const updateTitle = (id : string, title : string) => {
	return proxyAPI.post(
		`/notes/update/title`,
		{ _id: id, title: title },
		{ responseType: 'json' }
	);
};


export const deleteNotes = (id : string) => {
	return proxyAPI.post(
		`/notes/delete`,
		{ _id: id },
		{ responseType: 'json' }
	);
};