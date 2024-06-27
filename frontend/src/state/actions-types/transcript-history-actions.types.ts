import { TranscriptionHistory } from '../../models/transcribe-history-response.model';
import { UserTranscriptionTypes } from '../types/index';
import { TranscribedText, TranscribedTextMoment } from './../../models/offline-transcribe-job.model';

interface GetAllTranscriptHistoriesAction{
	type: UserTranscriptionTypes.SET_THIS_USER_HISTORY,
	history: TranscriptionHistory[],
	totalHistory: number
}

interface SetSelectedTranscriptionHistoryAction{
	type: UserTranscriptionTypes.SET_SELECTED_TRANSCRIPTION_HISTORY,
	selectedTranscriptHistory: TranscriptionHistory
}

interface SetSelectedTranscriptionTextAction{
	type: UserTranscriptionTypes.SET_SELECTED_TRANSCRIPTION_TEXT,
	selectedTranscriptionText: TranscribedTextMoment[]
}

export type MgtTranscriptHistoriesAction = GetAllTranscriptHistoriesAction 
	| SetSelectedTranscriptionHistoryAction
	| SetSelectedTranscriptionTextAction;