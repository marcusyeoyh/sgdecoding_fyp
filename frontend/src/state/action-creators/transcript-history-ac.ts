import { AxiosResponse } from 'axios';
import moment from 'moment';
import { Dispatch } from "redux";
import { getOneUserSpeechHistory } from '../../api/batch-transcribe-api';
import { OneUserTranscriptionHistoryResponse } from '../../models/transcribe-history-response.model';
import { MgtTranscriptHistoriesAction } from '../actions-types/transcript-history-actions.types';
import { store } from "../store";
import { UserTranscriptionTypes } from '../types';
import { getOneTranscriptInJson } from './../../api/batch-transcribe-api';
import { TranscribedTextResponse,TranscribedTextMoment } from './../../models/offline-transcribe-job.model';
import { TranscriptionHistory } from './../../models/transcribe-history-response.model';


export const getLoggedInUserTranscriptionHistory = () => {
	return async (dispatch: Dispatch) => {
		console.log("[DEBUG] getting transcripting history....");
		const { email } = store.getState().authReducer;

		await getOneUserSpeechHistory(email).then(
			(res: AxiosResponse<any>) => {
				let transcriptionHistory: OneUserTranscriptionHistoryResponse = res.data;
				transcriptionHistory.history = transcriptionHistory.history.map((h) => {
					// map a new property out called "title" for displaying in View-All-Jobs and View-One-Job
					let title = h.type === 'live' ? "Live Transcribe on " : "File Upload on ";
					title += moment(h.createdAt).format("ddd D MMM YYYY, h:mma");
					title += h.input[0].errorCode !== null ? ` (${h.input[0].errorCode})` : '';
					h.title = title;
					return h;
				});

				let action: MgtTranscriptHistoriesAction = {
					type: UserTranscriptionTypes.SET_THIS_USER_HISTORY,
					history: transcriptionHistory.history,
					totalHistory: transcriptionHistory.totalHistory
				};
				dispatch(action);

				return Promise.resolve();

			}).catch((error) => {
				console.error("[ERROR] Unable to get user transcription history");
				console.error(error);
				return Promise.reject();
			});
	};
};

export const setSelectedTranscriptionHistory = (selectedTranscriptHistory: TranscriptionHistory) => {
	return (dispatch: Dispatch) => {
		let action: MgtTranscriptHistoriesAction = {
			type: UserTranscriptionTypes.SET_SELECTED_TRANSCRIPTION_HISTORY,
			selectedTranscriptHistory
		};

		dispatch(action);
	};
};


export const getSelectedTranscriptionText = (selectedTranscriptionId: string) => {
	return async (dispatch: Dispatch) => {
		await getOneTranscriptInJson(selectedTranscriptionId).then(
			(res: AxiosResponse<TranscribedTextResponse>) => {
				let postProcTranscribedText = res.data.transcribedText.map(
					(v, i, a) => {
						v.startTime = moment(v.startTime, 'HH:mm:ss');
						v.endTime = moment(v.endTime, 'HH:mm:ss');
						return v;
					});

					let currArr = []; 
					if(postProcTranscribedText.length ===1){
						const transcribedText = new TranscribedTextMoment();
						transcribedText.startTime = (moment(postProcTranscribedText[0].startTime, 'HH:mm:ss,SSS').format('mm:ss'));
						transcribedText.endTime = (moment(postProcTranscribedText[0].endTime, 'HH:mm:ss,SSS').format('mm:ss'));
						transcribedText.text = postProcTranscribedText[0].text;
						currArr.push(transcribedText);
					}
					let prevEndTime = postProcTranscribedText[0].endTime;
					let i =1;
					let startPos = 0;
					while(startPos<postProcTranscribedText.length && i<postProcTranscribedText.length){
						prevEndTime = postProcTranscribedText[startPos].endTime;
						var duration = moment.duration(postProcTranscribedText[i].startTime.diff(prevEndTime)).asSeconds();
						console.log(Number(duration));
						while(i<postProcTranscribedText.length && Number(duration) <=3){
							postProcTranscribedText[startPos].endTime = postProcTranscribedText[i].endTime;
							postProcTranscribedText[startPos].text += ". "+postProcTranscribedText[i].text;
							prevEndTime = postProcTranscribedText[i].endTime;
							i+=1;
						}
						const transcribedText = new TranscribedTextMoment();
						transcribedText.startTime = (moment(postProcTranscribedText[startPos].startTime, 'HH:mm:ss,SSS').format('mm:ss'));
						transcribedText.endTime = (moment(postProcTranscribedText[startPos].endTime, 'HH:mm:ss,SSS').format('mm:ss'));
						transcribedText.text = postProcTranscribedText[startPos].text;
						currArr.push(transcribedText);
						startPos+=1;
					}
				
				let action: MgtTranscriptHistoriesAction = {
					type: UserTranscriptionTypes.SET_SELECTED_TRANSCRIPTION_TEXT,
					selectedTranscriptionText: currArr
				};

				dispatch(action);
			}
		);
	};

};