import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Button, ButtonProps, Card, Container, Dropdown, DropdownProps, Grid, Header, Icon, Label } from "semantic-ui-react";
import VizFreqBars from "../../components/audio/freq-bars-visualisation.component";
import LiveDecodeBtns from "../../components/audio/live-transcribe-btns.component";
import NoMicAccess from "../../components/audio/no-mic-access.component";
import VizOscilloscope from "../../components/audio/oscilloscope-visualisation";
import SubscriptionEndPortal from "../../components/audio/subscription-end.component";
import { RootState } from "../../state/reducers";
import styles from './live-transcribe.module.scss';

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
	final: string[],
	nonFinal: string
}

const languageOptions = [
	{ key: 'default', text: 'Singapore English', value: 'default' },
	{ key: 'english_malay_v2', text: 'English Malay', value: 'english_malay_v1' },
	{ key: 'trilingual_v2_2023', text: 'English Malay Chinese', value: 'trilingual_v2_2023' },
	{ key: 'english_indon_v1', text: 'English Bahasa Indonesian', value: 'english_indon_v1' },
	{ key: 'english_mandarin_v1', text: 'English Chinese', value: 'english_mandarin_v1' },
];


const LiveDecodePage: React.FC = () => {
	/* Declarations */
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

	// const [webSocketConn, setWebSocketConn] = useState<WebSocket>();
	const webSocketConnRef = useRef<WebSocket>();
	// webSocketConnRef.current = webSocketConn;

	// const [adaptationState, setAdaptationState] = useState<AdaptationState>();
	// const adaptationStateRef = useRef<AdaptationState>();
	// adaptationStateRef.current = adaptationState;

	const [transcription, setTranscription] = useState<Transcription>({
			final: [],
			nonFinal: ""
		});

	const [allRecordedChunks, setAllRecordedChunks] = useState<Float32Array[]>([]);

	const [isLoading, setIsLoading] = useState(true);
	const [showChangeVizOverlay, setShowChangeVizOverlay] = useState(false);
	const [selectedViz, setSelectedViz] = useState("Oscilloscope");
	const [selectedLangModel, setSelectedLangModel] = useState<string>("default");

	const { hasSubEnded } = useSelector((state: RootState) => state.authReducer);
	const { final, nonFinal } = useSelector((state: RootState) => state.liveTranscribeReducer);

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
		// var audioCtx = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 16000})
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
		console.log(location);
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


	if (isLoading)
		return (<Container></Container>);
	if (recorder.isMicAccessGiven === false)
		return (
			<div style={{ textAlign: 'center' }}>
				<NoMicAccess errorMsg={recorder.errorMsg ? recorder.errorMsg : ''} />
			</div>
		);
	else
		return (
			<div id={styles.livePgContainer}>
				<div id={styles.headerContainer}>
					<Header as="h1">Live Transcribe</Header>
					<p>Live decoding transcribes your speech into text as you speak into the microphone. Click the start button to begin decoding!</p>
				</div>
				<Card
					// color={recorder.isRecording === RecordingStates.IN_PROGRESS ? "green" : "purple"}
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
						{
							showChangeVizOverlay
								?
								<Icon name='close' id={styles.vizCogClose} size="large" onClick={onVizCogClick} />
								:
								<Icon name='cog' id={styles.vizCog} size="large" onClick={onVizCogClick} />
						}
						<div id={styles.changeVizBtns} className={showChangeVizOverlay ? styles.showVizOverlay : styles.hideVizOverlay}>						<Button.Group inverted size="large">
							<Button
								onClick={onChangeVizBtnClick}
								primary={selectedViz === 'Frequency Bars'}
							>
								Frequency Bars
							</Button>

							<Button.Or />

							<Button
								primary={selectedViz === 'Oscilloscope'}
								onClick={onChangeVizBtnClick}
							>
								Oscilloscope
							</Button>
						</Button.Group>
						</div>

						<Grid padded>
							<Grid.Row id={styles.selLangModelContainer}>
								<label style={{ lineHeight: '38px', marginRight: '12px' }}>
									<strong>Select Language Model: </strong>
								</label>
								<Dropdown
									scrolling
									labeled
									placeholder='Language Model'
									// fluid
									selection
									defaultValue={"default"}
									options={languageOptions}
									onChange={onSelLanguageModelChange}
									disabled={recorder.isRecording === RecordingStates.IN_PROGRESS
										|| recorder.isRecording === RecordingStates.STOPPED 
										|| hasSubEnded }
								/>
							</Grid.Row>

							<Grid.Row style={{zIndex: '2'}}>
								<Container id={styles.transcriptArea}>
									{
										recorder.isRecording === RecordingStates.NOT_STARTED
											?
											"Press \"Start\" to begin..."
											:
											final
									}
								</Container>
							</Grid.Row>

							<Grid.Row>
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
								{/* </Grid.Column> */}
							</Grid.Row>
							<Grid.Row id={styles.liveDecodeBtns}>
								<LiveDecodeBtns
									// key={transcription.final.length}
									IS_DEBUGGING={IS_DEBUGGING}
									recorder={recorder}
									setRecorder={setRecorder}
									// transcription={transcription}
									// setTranscription={setTranscription}
									webSocketRef={webSocketConnRef}
									allRecordedChunks={allRecordedChunks}
									selectedLangModel={selectedLangModel}
								/>
							</Grid.Row>
						</Grid>
					</Card.Content>
				</Card>
				<SubscriptionEndPortal shouldOpen={hasSubEnded} />
			</div>
		);
};

export default LiveDecodePage;