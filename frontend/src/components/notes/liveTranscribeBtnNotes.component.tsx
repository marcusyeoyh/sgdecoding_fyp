import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, Container, Icon } from "semantic-ui-react";
import { liveDecodeSocket } from "../../api/api";
import { convertToWAVFile, ConvToWavConfig } from "../../helpers/audio-helpers";
import { AdaptationState, AdaptationStateResponse, isHypothesisResponse, LiveDecodeResponse } from "../../models/live-decode-response.model";
import { MyRecorder, RecordingStates, 
	// Transcription
 } from "../../pages/user/live-transcribe.page";
import { actionCreators } from "../../state";
import { RootState } from "../../state/reducers";
import styles from './liveTranscribeBtnNotes.module.scss';
import { useLocation } from "react-router";

// TODO use Redux Store for these props.
interface Props {
	IS_DEBUGGING: boolean,
	setEditDisable: React.Dispatch<React.SetStateAction<boolean>>,
	// transcription: Transcription,
	// setTranscription: React.Dispatch<React.SetStateAction<Transcription>>,
	recorder: MyRecorder,
	setRecorder: React.Dispatch<React.SetStateAction<MyRecorder>>,
	webSocketRef: React.MutableRefObject<WebSocket | undefined>,
	allRecordedChunks: Float32Array[],
	selectedLangModel: string,
	// setIsUserSubscriptionEnded: Function
}

const LiveDecodeBtns: React.FC<Props> = (
	{ IS_DEBUGGING, setEditDisable,
		// transcription, setTranscription, 
		webSocketRef, recorder, setRecorder, allRecordedChunks, selectedLangModel }
) => {
	/* */

	const [webSocketConn, setWebSocketConn] = useState<WebSocket>();
	const [time, setTime] = useState(0);
	const [adaptationState, setAdaptationState] = useState<AdaptationState>();
	const adaptationStateRef = useRef<AdaptationState>();
	adaptationStateRef.current = adaptationState;

	const dispatch = useDispatch();
	const { setUserSubscriptionEnded } = bindActionCreators(actionCreators, dispatch);
	const { liveTranscriptionEnded } = bindActionCreators(actionCreators, dispatch);
	const { addTranscriptedNotes } = bindActionCreators(actionCreators, dispatch);
	const { updateNotesAPI } = bindActionCreators(actionCreators, dispatch);
	const { token, hasSubEnded } = useSelector((state: RootState) => state.authReducer);
	const { final, nonFinal } = useSelector((state: RootState) => state.liveTranscribeReducer);
    const { selectedNotes } = useSelector((state: RootState) => state.notesReducer);

	
	const {search} = useLocation();
    const documentId = new URLSearchParams(search).get('id')!;

	const onStartClick = () => {
		console.log("[DEBUG] Are you in Debug mode: " + IS_DEBUGGING);
		setEditDisable(true);
		if (!IS_DEBUGGING) {
			webSocketConn?.close();
			const conn = liveDecodeSocket(token, selectedLangModel);

			conn.onmessage = (event) => {
				console.log("[DEBUG] Received response from gateway");
				console.log(event);
				const { data } = event;
				const response: LiveDecodeResponse = JSON.parse(data);
				if (response.status === 0) {
					if (isHypothesisResponse(response)) {
						console.log('[DEBUG] HYPOTHESIS RESPONSE RECEIVED');
						const { final, hypotheses } = response.result;
						let newTranscription = (hypotheses[0].transcript).toLowerCase() + " \n";
						console.log(newTranscription);

						// liveTranscriptionEnded({ nonFinal: "", final: [newTranscription] });
						if (response.result.final == true) {
							liveTranscriptionEnded({ nonFinal: "", final: [newTranscription]});
						}

					} else {
						console.log('[DEBUG] ADAPTATION RESPONSE RECEIVED');
						setAdaptationState((response as AdaptationStateResponse).adaptation_state);
					}
				} else if (response.status === 200) {
					console.log("[DEBUG] Successfully connected to the server");
					recorder.audioWorklet!.port.postMessage({ isRecording: RecordingStates.IN_PROGRESS });
					setRecorder({ ...recorder, isRecording: RecordingStates.IN_PROGRESS });
				}
			};

			conn.onopen = (event) => {
				console.log("[DEBUG] Connection to backend opened");
				const start_signal = JSON.stringify({"signal": "start","continuous_decoding": true,"nbest":1, "sample_rate":16000, "hot_list":0});
				conn.send(start_signal);
			};

			conn.onerror = (error) => {
				console.error("[ERROR DEBUG] Error with websocket connection");
				console.log(error);
			};

			conn.onclose = (event) => {
				console.log("[DEBUG] onclose");
				if (event.reason !== "") {
					const reason = JSON.parse(event.reason);
					if (reason && reason.message === "Subscription has been expired") {
						console.log("Your trial has expired, you cannot access this feature");
						setUserSubscriptionEnded(true);
					}
				}
			};

			setWebSocketConn(conn);
			webSocketRef.current = conn;
		} else {
			recorder.audioWorklet!.port.postMessage({ isRecording: RecordingStates.IN_PROGRESS });
			setRecorder({ ...recorder, isRecording: RecordingStates.IN_PROGRESS });
		}
	};

	const onStopClick = () => {
		setEditDisable(false);

		recorder.audioWorklet!.port.postMessage({ isRecording: RecordingStates.STOPPED });
		setRecorder({ ...recorder, isRecording: RecordingStates.STOPPED });
		console.log("debug, ON STOP CLICK",final);
		addTranscriptedNotes(selectedNotes?.text+"\n"+final[0]);
		const currentNotes = JSON.stringify([{'insert':selectedNotes?.text+"\n"+final[0]}]);
		updateNotesAPI(documentId,currentNotes);
		liveTranscriptionEnded({ nonFinal: "", final: [""] });
		if (!IS_DEBUGGING) {
			webSocketConn?.close();
			setWebSocketConn(undefined);
		}
	};

	const onRedoClick = () => {
		window.location.reload();
	};

	const onDownloadClick = () => {
		console.log("[DEBUG] createDownloadLink");
		if (allRecordedChunks.length > 0) {
			const config: ConvToWavConfig = {
				sampleRate: 16000,
				// desiredSampRate: 16000,
				internalInterleavedLength: allRecordedChunks.length * allRecordedChunks[0].length,
				monoChnlBuffer: allRecordedChunks,
			};
			//TODO this transposes voice
			convertToWAVFile(config, function (buffer: any, view: any) {
				var blob = new Blob([buffer], { type: 'audio/x-wav' });
				console.log(blob);

				var url = URL.createObjectURL(blob);
				var anchor = document.createElement('a');
				anchor.style.display = 'none';
				document.body.appendChild(anchor);
				anchor.href = url;
				anchor.download = 'audio.wav';
				anchor.onclick = () => {
					requestAnimationFrame(() => {
						URL.revokeObjectURL(anchor.href);
					});
					document.body.removeChild(anchor);
				};
				anchor.click();
			});
		} else {
			console.error("[ERROR DEBUG] No recording found!");
		}
	};

	const onDownloadTextClick = () => {
		var element = document.createElement('a');
		let finalString = final.join(" ");
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(finalString));
		element.setAttribute('download', "transcribed_text.txt");

		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};



	/* */
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (recorder.isRecording === RecordingStates.IN_PROGRESS) {
			interval = setInterval(() => {
				// console.log(time);
				setTime(prevTime => prevTime + 1);
			}, 1000);
		}

		return () => {
			console.log("[DEBUG] BtnsArray Unmounted");
			if (interval !== null) {
				console.log("[DEBUG] BtnsArray: Cleared Interval");
				clearInterval(interval);
			}
		};
	}, [recorder.isRecording]);

	return (
		<div>
		<Container id={styles.recordBtnContainer}>
			{
				recorder.isRecording === (RecordingStates.NOT_STARTED || RecordingStates.STOPPED)
					?
					<Icon.Group
						role='button'
						aria-label='start record button'
						size='big'
						id={hasSubEnded ? styles.recordBtnDisabled : styles.recordBtn} onClick={onStartClick}
					>
						<Icon size='huge' name='circle' />
						<Icon name='microphone' size="large" />
					</Icon.Group>
					:
					recorder.isRecording === RecordingStates.IN_PROGRESS
						?
						<Icon.Group
							size='big'
							id={styles.stopBtn}
							onClick={onStopClick}
							role='button'
							aria-label='stop record button'
						>
							<Icon size='huge' name='circle' />
							<Icon name='stop' />
							<span>{`${("0" + Math.floor((time / 3600) % 3600)).slice(-1)}:${("0" + Math.floor((time / 60) % 60)).slice(-2)}:${("0" + Math.floor(time % 60)).slice(-2)}`}</span>
						</Icon.Group>
						:
						<Icon.Group
						role='button'
						aria-label='start record button'
						size='big'
						id={hasSubEnded ? styles.recordBtnDisabled : styles.recordBtn} onClick={onStartClick}
					>
						<Icon size='huge' name='circle' />
						<Icon name='microphone' size="large" />
					</Icon.Group>
			}
		</Container>
		</div>
	);
};

// TODO IMPORTANT
//https://codepen.io/anon/pen/ywJxzV?editors=1111
export default React.memo(LiveDecodeBtns);