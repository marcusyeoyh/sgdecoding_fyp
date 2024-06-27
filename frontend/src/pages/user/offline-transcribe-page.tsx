import axios, { CancelTokenSource } from "axios";
import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, ButtonProps, Card, Checkbox, Container, Dropdown, DropdownProps, Grid, Header, Icon, Progress } from "semantic-ui-react";
import { submitOneJob } from "../../api/batch-transcribe-api";
import SubscriptionEndPortal from "../../components/audio/subscription-end.component";
import { actionCreators } from "../../state";
import { RootState } from "../../state/reducers";
import styles from './offline-transcribe-page.module.scss';
import {backendBaseURL} from "../../api/api";
enum AudioFileUploadStates {
	SELECTING_FILES = "selectingFiles",
	SELECTED_FILES = "selectedFiles",
	UPLOADING = "uploading",
	UPLOAD_FINISHED = "uploadFinished",
}

const OfflineTranscribePage: React.FC = () => {
	const languageOptions = [
		{
			text: "english",
			value: "english",
		},
		{
			text: "mandarin",
			value: "mandarin",
		},
		{
			text: "malay",
			value: "malay",
		},
		{
			text: "english-mandarin",
			value: "english-mandarin",
		},
		{
			text: "english-malay",
			value: "english-malay",
		},
	];

	const audioOptions = [
		{
			text: "fartalk",
			value: "fartalk",
		},
		{
			text: "closetalk",
			value: "closetalk",
		},
		{
			text: "mobile",
			value: "mobile",
		},
		{
			text: "telephony",
			value: "telephony",
		},
		{
			text: "boundary",
			value: "boundary",
		},
	];

	const dispatch = useDispatch();
	const { setUserSubscriptionEnded } = bindActionCreators(actionCreators, dispatch);
	const { sub, hasSubEnded } = useSelector((state: RootState) => state.authReducer);
	const {  email } = useSelector((state: RootState) => state.authReducer);

	const [uploadState, setUploadState] = useState(AudioFileUploadStates.SELECTING_FILES);
	const [uploadArray, setUploadArray] = useState<
		Array<{
			file: File;
			name: string;
			size: number;
			lang: string;
			audioType: string;
			audioTrack: string;
			cancelToken: CancelTokenSource;
			isUploadFinished: boolean
		}>
	>([]);
	const [progressBar, setProgressBar] = useState<
		Array<{
			percent: number;
			isActive: boolean;
			isHidden: boolean;
			hasError: boolean;
			label: string;
		}>
	>([]);

	const createProgressBar = async (
		uploadPercent: number,
		uploadIsActive: boolean,
		uploadIsHidden: boolean,
		uploadHasError: boolean,
		uploadLabel: string
	) => {
		let newBar = {
			percent: uploadPercent,
			isActive: uploadIsActive,
			isHidden: uploadIsHidden,
			hasError: uploadHasError,
			label: uploadLabel,
		};
		setProgressBar((prev) => [...prev, newBar]);
	};

	const handleProgressChange = (
		i: number,
		data: {
			uploadPercent: number;
			uploadIsActive: boolean;
			uploadIsHidden: boolean;
			uploadHasError: boolean;
			uploadLabel: string;
		}
	) => {
		const progressArray = progressBar.slice();
		progressArray[i].percent = data.uploadPercent;
		progressArray[i].isActive = data.uploadIsActive;
		progressArray[i].isHidden = data.uploadIsHidden;
		progressArray[i].hasError = data.uploadHasError;
		progressArray[i].label = data.uploadLabel;
		setProgressBar(progressArray);
	};

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log(e);
		let selectedFile = e.target.files![0];
		let newUpload = {
			file: selectedFile,
			name: selectedFile.name,
			size: selectedFile.size,
			lang: "english",
			audioType: "closetalk",
			audioTrack: "multi",
			cancelToken: axios.CancelToken.source(),
			isUploadFinished: false
		};
		setUploadArray((prev) => [...prev, newUpload]);
		createProgressBar(0, false, true, false, "");
		setUploadState(AudioFileUploadStates.SELECTED_FILES);
	};

	const formatBytes = (bytes: number, decimals = 2) => {
		//https://thewebdev.info/2021/03/20/how-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript/
		if (bytes === 0) {
			return "0 Bytes";
		}
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	};

	const handleLangChange = (i: number, data: DropdownProps) => {
		var array = [...uploadArray];
		let file = { ...array[i] };
		file.lang = data.value as string;
		array[i] = file;
		setUploadArray(array);
	};

	const handleAudioChange = (i: number, data: DropdownProps) => {
		var array = [...uploadArray];
		let file = { ...array[i] };
		file.audioType = data.value as string;
		array[i] = file;
		setUploadArray(array);
	};

	const handleChannelChange = (i: number) => {
		var array = [...uploadArray];
		let file = { ...array[i] };
		file.audioTrack = file.audioTrack === "multi" ? "single" : "multi";
		array[i] = file;
		setUploadArray(array);
	};

	const removeFile = (index: number) => {
		console.log("remove index " + index);
		var array = [...uploadArray];
		var progressArray = [...progressBar];
		if (index !== -1) {
			array.splice(index, 1);
			setUploadArray(array);
			progressArray.splice(index, 1);
			setProgressBar(progressArray);
		}
	};

	const handleUploadClick = async () => {
		// setCancelDisabled(true);
		setUploadState(AudioFileUploadStates.UPLOADING);
		const uploadAll = await Promise.all(uploadArray.map(async (item, i) => {
			const formData = new FormData();
			//TODO : to verify!
			const url = backendBaseURL + "/notif/email/" + email;
			console.log("url",url);
			formData.append("file", item.file);
			formData.append("lang", item.lang);
			formData.append("audioType", item.audioType);
			formData.append("audioTrack", item.audioTrack);
			formData.append("webhook", url);

			handleProgressChange(i, {
				uploadPercent: 50,
				uploadIsActive: true,
				uploadIsHidden: false,
				uploadHasError: false,
				uploadLabel: "Uploading...",
			});
			formData.append('userID', sub);

			return await submitOneJob(formData, item.cancelToken).then((res) => {
				console.log(res.data);
				if (res.data === 201) {
					handleProgressChange(i, {
						uploadPercent: 100,
						uploadIsActive: false,
						uploadIsHidden: false,
						uploadHasError: false,
						uploadLabel: "Upload Successful!",
					});
				} else {
					console.log(res);
					const errorMsg = res.data.message ? ": " + res.data.message : "";
					handleProgressChange(i, {
						uploadPercent: 0,
						uploadIsActive: false,
						uploadIsHidden: false,
						uploadHasError: true,
						uploadLabel: "Upload Error" + errorMsg,
					});
				}
			});
		})).catch((error) => {
			console.log(error);
		});
	
		console.log(uploadAll);
		setUploadState(AudioFileUploadStates.UPLOAD_FINISHED);
	};

	const handleCancelUploadClick = async () => {
		try {
			console.log(uploadArray);
			uploadArray.forEach((item, index) => {
				if (progressBar[index].percent !== 100) {
					item.cancelToken.cancel();

					handleProgressChange(index, {
						uploadPercent: 0,
						uploadIsActive: false,
						uploadIsHidden: false,
						uploadHasError: true,
						uploadLabel: "Upload Cancelled",
					});
				}
			});

			setUploadState(AudioFileUploadStates.UPLOAD_FINISHED);
		} catch (error) {
			console.log(error);
		}
	};

	const handleStartOverClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
		window.location.reload();
	};


	return (
		<div id={styles.offlineTranscribePg}>
			<Container text textAlign="center" id={styles.headerContainer}>
				<Header as="h1">Offline Transcribe</Header>
				<p>
					In offline transcribing, you may upload local audio files and our servers will
					generate the text for you. The time taken for the transcription process depends
					on the length of audio file.
				</p>
			</Container>

			<Card fluid id={styles.uploadFileContainer}>
				<Card.Content>
					<Grid padded textAlign="center" container stackable>
						<Grid.Row columns={6} id={styles.uploadGridListHeader}>
							<Grid.Column>
								<strong><u>Name</u></strong>
							</Grid.Column>
							<Grid.Column>
								<strong><u>Size</u></strong>
							</Grid.Column>
							<Grid.Column>
								<strong><u>Language</u></strong>
							</Grid.Column>
							<Grid.Column>
								<strong><u>Audio Type</u></strong>
							</Grid.Column>
							<Grid.Column>
								<strong><u>Channel</u></strong>
							</Grid.Column>
							<Grid.Column />
						</Grid.Row>
						{
							uploadArray.length === 0
								?
								<Container text textAlign="center" as="p" id={styles.noFileChosenMsg}>
									You have not selected any files yet. Click "Choose a File" to start!
								</Container>
								:
								null
						}
						{
							uploadArray.map((item, i) => (
								<Grid.Row key={i} columns={6} id={styles.listItemRow} >
									<Grid.Column className={styles.mobileGridListItem}>
										<span className={styles.mobileGridListHeader}>Name:</span>
										<span>{item.name}</span>
									</Grid.Column>
									<Grid.Column className={styles.mobileGridListItem}>
										<span className={styles.mobileGridListHeader}>Size:</span>
										<span>{formatBytes(item.size)}</span>
									</Grid.Column>
									<Grid.Column className={styles.mobileGridListItem}>
										<span className={styles.mobileGridListHeader}>Language:</span>
										<Dropdown
											compact
											selection
											options={languageOptions}
											value={item.lang}
											disabled={uploadState === AudioFileUploadStates.UPLOADING || uploadState === AudioFileUploadStates.UPLOAD_FINISHED}
											onChange={(
												e: React.SyntheticEvent<HTMLElement, Event>,
												data: DropdownProps
											) => handleLangChange(i, data)}
										/>
									</Grid.Column>
									<Grid.Column className={styles.mobileGridListItem}>
										<span className={styles.mobileGridListHeader}>Audio Type:</span>
										<Dropdown
											compact
											selection
											options={audioOptions}
											value={item.audioType}
											disabled={uploadState === AudioFileUploadStates.UPLOADING || uploadState === AudioFileUploadStates.UPLOAD_FINISHED}
											onChange={(
												e: React.SyntheticEvent<HTMLElement, Event>,
												data: DropdownProps
											) => handleAudioChange(i, data)}
										/>
									</Grid.Column>
									<Grid.Column className={`${styles.mobileGridListItem} ${styles.channelControlBtn}`}>
										<span className={styles.mobileGridListHeader}>Channel:</span>
										<div>
											<Checkbox
												slider
												disabled={uploadState === AudioFileUploadStates.UPLOADING || uploadState === AudioFileUploadStates.UPLOAD_FINISHED}
												checked={item.audioTrack === "single"}
												onChange={(e: React.FormEvent<HTMLInputElement>) =>
													handleChannelChange(i)
												}
											/>
											<span>{item.audioTrack === 'multi' ? "Stereo" : "Mono"}</span>
										</div>
									</Grid.Column>
									<Grid.Column width={1} className={styles.mobileGridListItem}>
										<span className={styles.mobileGridListHeader}>Remove file:</span>
										<Button
											icon="trash alternate outline"
											disabled={uploadState === AudioFileUploadStates.UPLOADING || uploadState === AudioFileUploadStates.UPLOAD_FINISHED}
											onClick={() => removeFile(i)}
										></Button>
									</Grid.Column>
									<Grid.Column width="16">
										<div hidden={progressBar[i].isHidden} >
											<Progress
												percent={progressBar[i].percent}
												size="small"
												active={progressBar[i].isActive}
												// progress={"percent"}
												color="green"
												error={progressBar[i].hasError}
												label={progressBar[i].label}
											/>
										</div>
									</Grid.Column>
								</Grid.Row>
							))
						}
					</Grid>
					<Button
						as="label"
						htmlFor="file"
						type="button"
						// animated="fade"
						attached="bottom"
						disabled={uploadState === AudioFileUploadStates.UPLOADING || uploadState === AudioFileUploadStates.UPLOAD_FINISHED || hasSubEnded}
						id={styles.chooseFileBtn}
						primary
					>
						<Button.Content visible>ADD MORE FILES</Button.Content>
						<Button.Content hidden>
							<Icon name="file" />
						</Button.Content>
					</Button>
					<input type="file" id="file" hidden onChange={onFileChange} />
				</Card.Content>

				<Card.Content>
					{
						(uploadState === AudioFileUploadStates.SELECTING_FILES || uploadState === AudioFileUploadStates.SELECTED_FILES) &&
						<Button
							onClick={handleUploadClick}
							disabled={uploadState === AudioFileUploadStates.SELECTING_FILES || hasSubEnded}
							primary
							id={styles.uploadBtn}
						>
							Upload
						</Button>
					}
					{
						uploadState === AudioFileUploadStates.UPLOADING &&
						<Button onClick={handleCancelUploadClick} disabled={hasSubEnded} secondary id={styles.uploadBtn}>Cancel Upload</Button>
					}
					{
						uploadState === AudioFileUploadStates.UPLOAD_FINISHED &&
						<Button onClick={handleStartOverClick} disabled={hasSubEnded} color="green" id={styles.uploadBtn}>Start over</Button>
					}
				</Card.Content>

			</Card>

			<SubscriptionEndPortal shouldOpen={hasSubEnded} />
		</div>
	);
};

export default OfflineTranscribePage;