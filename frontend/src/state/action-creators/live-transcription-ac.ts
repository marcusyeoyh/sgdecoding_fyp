
import { LivetranscribeTypes } from "../types/index";
import { liveTranscribeAction } from "../actions-types/live-transcribe-action.types";
import { Dispatch } from "redux";

export interface Transcription {
	final: string[],
	nonFinal: string
}
export const liveTranscriptionEnded = (transcription : Transcription) => {
	let currentTranscription: liveTranscribeAction = {
		type: LivetranscribeTypes.ENDED,
		final: transcription.final,
		nonFinal: transcription.nonFinal
	};
	return (dispatch: Dispatch) => {
		console.log("dispatch ended");
		dispatch(currentTranscription);

	};
};


