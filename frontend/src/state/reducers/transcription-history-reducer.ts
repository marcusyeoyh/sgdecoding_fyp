import { MgtTranscriptHistoriesAction } from '../actions-types/transcript-history-actions.types';
import { UserTranscriptionTypes } from '../types/index';
import { TranscribedText, TranscribedTextMoment } from './../../models/offline-transcribe-job.model';
import { TranscriptionHistory } from './../../models/transcribe-history-response.model';

interface TranscriptHistoryState{
	history: TranscriptionHistory[] | null,
	totalHistory: number,
	selectedTranscriptHistory: TranscriptionHistory | undefined,
	selectedTranscriptionText: TranscribedTextMoment[]
}

export const INITIAL_STATE: TranscriptHistoryState = {
	history: null,
	totalHistory: 0,
	selectedTranscriptHistory: undefined,
	selectedTranscriptionText: []
};

const reducer = (state = INITIAL_STATE, action: MgtTranscriptHistoriesAction) => {
	switch (action.type) {
		case UserTranscriptionTypes.SET_THIS_USER_HISTORY:
			const { history, totalHistory } = action;
			return {...state, history, totalHistory };

		case UserTranscriptionTypes.SET_SELECTED_TRANSCRIPTION_HISTORY:
			const { selectedTranscriptHistory } = action;
			return { ...state, selectedTranscriptHistory};

		case UserTranscriptionTypes.SET_SELECTED_TRANSCRIPTION_TEXT:
			const { selectedTranscriptionText } = action;
			return { ...state, selectedTranscriptionText };

		default:
			return state;
	}
};

export default reducer;