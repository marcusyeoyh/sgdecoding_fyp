import { Dispatch } from "redux";
import { NavbarChangeTypes } from "../types/index";
// export const addToStoreTest = (num: number) => {
// 	return (dispatch: Dispatch) => {
// 		dispatch({
// 			type: TestType.ADD,
// 			payload: num
// 		});
// 	};
// };

// export const subToStoreTest = (num: number) => {
// 	return (dispatch: Dispatch) => {
// 		dispatch({
// 			type: TestType.MINUS,
// 			payload: num
// 		});
// 	};
// };

export const toggleSidebar = () => {
	return (dispatch: Dispatch) => {
		dispatch({
			type: NavbarChangeTypes.TOGGLE_SIDEBAR
		});
	};
};

export * from './auth-ac';
export * from './transcript-history-ac';
export * from './live-transcription-ac';
export * from './notes-ac';
export * from './shared-notes-ac';

