import { useState } from "react";
import { Button } from "semantic-ui-react";
import { downloadOneTranscriptionZipped } from "../../api/batch-transcribe-api";
import { TranscriptionHistory } from "../../models/transcribe-history-response.model";

interface Props {
	isDisabled: boolean,
	// transcriptTitle: string,
	// transcriptId: string,
	transcriptHistory: TranscriptionHistory,
	children?: any,
	id?: any,
	className?: any,
}


const DownloadTranscriptButton: React.FC<Props> = ({ transcriptHistory, isDisabled, id, className }) => {
	const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

	const onBtnClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		try {
			setIsLoadingTranscript(true);
			const result = await downloadOneTranscriptionZipped(transcriptHistory._id);

			console.log("[DEBUG] Download Result: ");
			console.log(result);
			const { url } = result.data;

			let anchor = document.createElement('a');
			anchor.style.display = 'none';
			anchor.href = url;
			//TODO Not working! Can't set the download file name
			anchor.download = transcriptHistory.title.replace(' ', '_') + ".zip";
			document.body.appendChild(anchor);
			anchor.onclick = () => {
				requestAnimationFrame(() => {
					URL.revokeObjectURL(anchor.href);
				});
				document.body.removeChild(anchor);
			}; // END anchor.onclick
			setIsLoadingTranscript(false);
			anchor.click();
		} catch (error) {
			console.error("[ERROR] Unable to download!");
			console.error({ error });
		}
	};

	return (
		<Button
			id={id ? id : ''}
			loading={isLoadingTranscript}
			icon={isLoadingTranscript ? "spinner" : null} // TODO Continue here
			className={className ? className : ''}
			disabled={isDisabled}
			color="green"
			onClick={onBtnClick}
			content='Download'
		/>
	);
};

export default DownloadTranscriptButton;