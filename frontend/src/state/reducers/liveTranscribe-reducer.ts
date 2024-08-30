import { LivetranscribeTypes } from "../types";
import { liveTranscribeAction } from '../actions-types/live-transcribe-action.types';

interface LiveTranscriptionState{
	final: string[],
    nonFinal: string
};

export const INITIAL_STATE: LiveTranscriptionState = {
	final: [],
	nonFinal: ""
};

const reducer = (state = INITIAL_STATE, action: liveTranscribeAction ) : LiveTranscriptionState => {
	switch (action.type) {
		case LivetranscribeTypes.ENDED:
            const { final, nonFinal } = action;

			// let updatedFinal: string[];
			// updatedFinal = [...state.final];

			// if (state.final.length > 0 && nonFinal !== "" && final.length === 0) {
			//   // Update the last element of state.final with nonFinal
			//   updatedFinal[updatedFinal.length - 1] = nonFinal;
			// } else if (nonFinal === "" && final.length > 0) {
			//   // Add final to state.final
			//   updatedFinal = Array.from(new Set([...state.final, ...final]));
			// }
			const updatedFinal = Array.from(new Set([...state.final, ...final]));
			return { ...state, final: updatedFinal, nonFinal };

        default:
			return state;
	}
};

export default reducer;