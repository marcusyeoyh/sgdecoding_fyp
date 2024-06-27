import {Moment} from "moment";
export interface OfflineTranscribeJob {
	form: FormData,
}

export interface OfflineTranscribeJobResponse {
	queue: string,
	result: object,
	status: string,
	formats: Array<String>,
	sampling: string,
	lang: string,
	name: string,
	_id: string,
	type: string,
	createdAt: string,
}

export interface TranscribedText {
	line: number,
	startTime: Moment,
	endTime: Moment,
	text: string
}
export class TranscribedTextMoment {
	line: number = 1;
	startTime: string = "";
	endTime: string = "";
	text: string = "";
  }


export interface TranscribedTextResponse {
	transcribedText: Array<TranscribedText>
}