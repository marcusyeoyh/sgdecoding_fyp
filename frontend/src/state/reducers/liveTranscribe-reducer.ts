import { LivetranscribeTypes } from "../types";
import { liveTranscribeAction } from '../actions-types/live-transcribe-action.types';
interface LiveTranscriptionState{
	final: string[],
    nonFinal: string
}

export const INITIAL_STATE: LiveTranscriptionState = {
	final: [],
	nonFinal: ""
};

const reducer = (state = INITIAL_STATE, action: liveTranscribeAction ) : LiveTranscriptionState=> {
	switch (action.type) {
		case LivetranscribeTypes.ENDED:
            const { final, nonFinal } = action;
			return {...state, final, nonFinal };
	
        default:
			return state;
	}
};

export default reducer;