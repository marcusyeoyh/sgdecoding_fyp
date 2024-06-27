import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { ButtonProps, Card, Container, Dropdown, DropdownProps, Grid, Header, Icon, Label } from "semantic-ui-react";
import VizFreqBars from "../audio/freq-bars-visualisation.component";
import LiveDecodeBtns from "./liveTranscribeBtnNotes.component";
import NoMicAccess from "../audio/no-mic-access.component";
import VizOscilloscope from "../audio/oscilloscope-visualisation";
import SubscriptionEndPortal from "../audio/subscription-end.component";
import { RootState } from "../../state/reducers";
import styles from './liveTranscribe.module.scss';
import './liveTranscribe.css';
import ReactMarkdown from "react-markdown";

export enum RecordingStates {
	NOT_STARTED = "notstarted",
	IN_PROGRESS = "inprogress",
	STOPPED = "stopped"
}

export interface MyRecorder {
	isMicAccessGiven: boolean,
	isRecording: RecordingStates,
	stream: MediaStream | null,
	audioContext: AudioContext | null,
	audioWorklet: AudioWorkletNode | null,
	errorMsg: string
}

export interface Transcription {
	final: String[],
	nonFinal: String
}

const languageOptions = [
	{ key: 'default', text: 'Singapore English', value: 'default' },
	{ key: 'english_malay_v2', text: 'English Malay', value: 'english_malay_v1' },
	{ key: 'trilingual_v2_2023', text: 'English Malay Chinese', value: 'trilingual_v2_2023' },
	{ key: 'english_indon_v1', text: 'English Bahasa Indonesian', value: 'english_indon_v1' },
	{ key: 'english_mandarin_v1', text: 'English Chinese', value: 'english_mandarin_v1' },
];


interface Props {
	editDisable: React.Dispatch<React.SetStateAction<boolean>>,
}

const LiveTranscribe: React.FC<Props> = (
	{ editDisable }
)=> {
	const IS_DEBUGGING: boolean = false;

	const [recorder, setRecorder] = useState<MyRecorder>({
		isMicAccessGiven: false,
		stream: null,
		isRecording: RecordingStates.NOT_STARTED,
		audioContext: null,
		audioWorklet: null,
		errorMsg: '',
	});
	const recorderRef = useRef<MyRecorder>();
	recorderRef.current = recorder;

	const location = useLocation();
	const {search} = useLocation();
    const title = new URLSearchParams(search).get('title')!;
	
	const webSocketConnRef = useRef<WebSocket>();

	const [allRecordedChunks, setAllRecordedChunks] = useState<Float32Array[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showChangeVizOverlay, setShowChangeVizOverlay] = useState(false);
	const [selectedViz, setSelectedViz] = useState("Oscilloscope");
	const [selectedLangModel, setSelectedLangModel] = useState<string>("eng_closetalk");

	const { hasSubEnded } = useSelector((state: RootState) => state.authReducer);
	const { final, nonFinal } = useSelector((state: RootState) => state.liveTranscribeReducer);
    const { selectedNotes } = useSelector((state: RootState) => state.notesReducer);

	const reqMicrophoneAccess = async (): Promise<MediaStream> => {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: { // Shorthand to write MediaTrackConstraints
				sampleRate: 48000, // Changing to 16k does nothing because browser capability is limited to min 48k
				sampleSize: 16,		 // 16-bits
				channelCount: 1, 	 // mono
				// noiseSuppression: true,
				echoCancellation: true
			},
			video: false
		});
		return stream;
	};

	const createAudioContext = () => {
		/* sampleRate property is not implemented in Firefox yet. Only Chrome. 
					Have to downsample manually.
					https://bugzilla.mozilla.org/show_bug.cgi?id=1674892
					*/
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		return audioContext;
	};

	/* 
		Worklet files must be placed in /public directory in React project 
		as addModule() looks for them in there
	*/
	const loadWorkletNode = useCallback(async (audioCtx: AudioContext, stream: MediaStream) => {
		await audioCtx.audioWorklet.addModule('worklet/audio-worklet.js');
		const source: MediaStreamAudioSourceNode = audioCtx.createMediaStreamSource(stream);
		const audioWorklet = new AudioWorkletNode(audioCtx, 'audio-processor', { outputChannelCount: [1] });
		source.connect(audioWorklet);

		audioWorklet.port.onmessage = async (event) => {
			const { frame16Int, frame32FloatDownsampled } = event.data;

			// console.log(recorderRef.current?.isRecording);
			if (recorderRef.current?.isRecording === RecordingStates.IN_PROGRESS) {
				if (!IS_DEBUGGING && webSocketConnRef.current) {
					var blob = new Blob([frame16Int], { type: 'audio/x-raw' });
					webSocketConnRef.current.send(blob);
				}
			} else if (recorderRef.current?.isRecording === RecordingStates.STOPPED) {
				// TODO save into store
				setAllRecordedChunks(frame32FloatDownsampled);
			}
		}; // END onmessage;

		audioWorklet.port.start();
		return audioWorklet;
	}, [IS_DEBUGGING]);

	const confirmNavAway = (e: BeforeUnloadEvent) => {
		e.preventDefault();
		if (recorderRef.current?.isRecording !== RecordingStates.NOT_STARTED)
			e.returnValue = "";
	};

	const onSelLanguageModelChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
		const { value } = data;
		console.log("[DEBUG] changed lang model: " + value);
		if (value && value !== '') {
			setSelectedLangModel(value as string);
		}
	};

	const onVizCogClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
		setShowChangeVizOverlay(!showChangeVizOverlay);
		console.log(showChangeVizOverlay);
	};

	const onChangeVizBtnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
		console.log(data);
		if (data.children)
			setSelectedViz(data.children.toString());
		setShowChangeVizOverlay(false);
	};


	

	useEffect(() => {
		// if(recorder.isRecording === RecordingStates.IN_PROGRESS)
		console.log(location);
		// 	window.confirm("are you sure?")
	}, [location]);

	useEffect(() => {
		/*	
			Workaround to prevent NoMicAccess from "blinking"
			Ideally, we want to use Permissions API to check 'microphone' permissions beforehand
			to know which state to present. However, as of now available only in Chrome but not in Firefox.
		*/
		setTimeout(() => {
			setIsLoading(false);
		}, 750);

		reqMicrophoneAccess()
			.then((stream) => {
				const audioContext = createAudioContext();
				console.log(stream);
				loadWorkletNode(audioContext, stream).then(
					(audioWorklet) => {
						setRecorder(r => ({ ...r, isMicAccessGiven: true, stream, audioContext, audioWorklet }));
					});
			}).catch(
				(error) => {
					console.error(`Error code: ${error.code}, Message: ${error.message}`);
					let msg = error.name === "NotAllowedError" ? 'You have denied giving microphone permissions' :
						'Something went terribly wrong, pleae contact an administrator!';
					setRecorder(r => ({ ...r, isMicAccessGiven: false, errorMsg: msg }));
				});

		/* 
			Workaround as usePrompt/useBlocker is not yet available in React Router v6 
			as of writing, Jan 2021. Ref: https://github.com/remix-run/react-router/issues/8139
			TODO https://gist.github.com/rmorse/426ffcc579922a82749934826fa9f743
		*/
		window.addEventListener('beforeunload', confirmNavAway);

		return () => {
			console.log("[DEBUG] Live Decode Page unmounted");
			if (recorderRef.current) {
				recorderRef.current.audioContext?.close();
				recorderRef.current.stream?.getTracks().forEach(track => track.stop());
			}
			// recorder.stream!.getAudioTracks()[0].enabled = false;
			window.removeEventListener('beforeunload', confirmNavAway);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadWorkletNode]);

	const text: string = selectedNotes?.text !== undefined ? selectedNotes.text : '';
	if (isLoading)
		return <Container></Container>;
	if (recorder.isMicAccessGiven === false)
		return (
			<div style={{ textAlign: 'center' }}>
				<NoMicAccess errorMsg={recorder.errorMsg ? recorder.errorMsg : ''} />
			</div>
		);
	else
		return (
			<div id={styles.livePgContainer}>
				<Card
					id={styles.containerCard}
					// color={recorder.isRecording === RecordingStates.IN_PROGRESS ? "green" : "purple"}
					fluid
				>
					<Card.Header style={{"textAlign":"left","marginTop":"30px","marginLeft":"50px"}}>
					<h3>{title}</h3>
						&nbsp;
						&nbsp;
					<div id={styles.livePgText}>
					<ReactMarkdown children={text} className="line-break" />
						<span>
						{final}</span>
					</div>
					</Card.Header >
				</Card>
				<Card
					fluid
					id={styles.livePgCard}
				>
					{/* Top Label saying "Ready to Record"/"Recording"/"Stopped" */}
					{
						recorder.isRecording === RecordingStates.NOT_STARTED
							?
							<Label id={styles.readyToRecordState} className={styles.recordingStateLbl}>
								<Icon name="info circle" />
								Ready to Record
							</Label>
							:
							recorder.isRecording === RecordingStates.IN_PROGRESS
								?
								<Label id={styles.inProgressState} className={styles.recordingStateLbl}>
									<Icon loading name="stop circle" />
									<span>Recording</span>
									<span></span>
								</Label>
								:
								<Label id={styles.finishedState} className={`${styles.recordingStateLbl} green`}>
									<Icon name="stop circle outline" />
									<span>Finished</span>
									<span></span>
								</Label>
					}
					<Card.Content>
						<Grid padded>
							<Grid.Column style={{"width":"30%"}}>
								<label style={{ lineHeight: '38px', marginRight: '12px' }}>
									<strong>Select Language Model </strong>
								</label>
								<Dropdown
									scrolling
									labeled
									placeholder='Language Model'
									// fluid
									selection
									defaultValue={"eng_closetalk"}
									options={languageOptions}
									onChange={onSelLanguageModelChange}
									disabled={recorder.isRecording === RecordingStates.IN_PROGRESS
										|| recorder.isRecording === RecordingStates.STOPPED 
										|| hasSubEnded }
								/>
							</Grid.Column>
							<Grid.Column style={{"width":"40%"}}>
								{/* <h1>test1</h1> */}
								<LiveDecodeBtns
									// key={transcription.final.length}
									IS_DEBUGGING={IS_DEBUGGING}
									recorder={recorder}
									setRecorder={setRecorder}
									setEditDisable={editDisable}
									// transcription={transcription}
									// setTranscription={setTranscription}
									webSocketRef={webSocketConnRef}
									allRecordedChunks={allRecordedChunks}
									selectedLangModel={selectedLangModel}
								/> 
							</Grid.Column>
							<Grid.Column style={{"width":"30%"}}>
							{/* <h1>test2</h1> */}

								{/* <Grid.Column width={16}> */} 
								<div id={styles.visualisationContainer}>
									{
										selectedViz === 'Oscilloscope'
											?
											<VizOscilloscope recorder={recorder} />
											:
											<VizFreqBars recorder={recorder} />
									} 

								</div>
							</Grid.Column>
						</Grid>
					</Card.Content>
				</Card>
				<SubscriptionEndPortal shouldOpen={hasSubEnded} />
			</div>
		);
};

export default LiveTranscribe;