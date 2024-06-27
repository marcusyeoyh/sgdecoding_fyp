import { NavbarChangeTypes } from "../types";

export const INITIAL_STATE = {
	IS_OPEN: true
};

const reducer = (state = INITIAL_STATE, action: { type: string }) => {
	switch (action.type) {
		case NavbarChangeTypes.TOGGLE_SIDEBAR:
			return { ...state, IS_OPEN: !state.IS_OPEN };
		default:
			return state;
	}
};

export default reducer;