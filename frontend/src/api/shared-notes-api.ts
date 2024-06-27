import { proxyAPI } from './api';

export const createSharedNotes = (userEmail : string, notesId :string) => {
	return proxyAPI.post(
		`/sharedNotes/new`,
		{ userEmail: userEmail,
         id: notesId
         },
		{ responseType: 'json' }
	);
};

export const getSharedNotes = (userEmail : string) => {
	return proxyAPI.post(
		`/sharedNotes`,
		{ userEmail: userEmail },
		{ responseType: 'json' }
	);
};


export const deleteSharedNotes = (id : string,userEmail:string) => {
	return proxyAPI.post(
		`/sharedNotes/delete`,
		{ _id: id, userEmail: userEmail },
		{ responseType: 'json' }
	);
};

