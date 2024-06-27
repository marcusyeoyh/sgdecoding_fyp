export interface LiveTranscriptionHistory {
	title: string,
	queue: string,
	status: string,
	formats: Array<String>,
	sampling: string,
	lang: string,
	name: string,
	_id: string,
	userCreated: {
		role: string,
		type: string,
		name: string,
		_id: string,
		isBlocked: boolean,
		isDeleted: boolean,
		isVerified: boolean,
		email: string,
		createdAt: string,
		updatedAt: string,
		__v: number
		forgetPasswordCode: string,
		forgetPasswordCodeSentAt: string
	},
	input: Array<
		{
			isSubmitted: boolean,
			errorCode: number,
			status: string,
			progress: [],
			_id: string,
			file: {
				children: [],
				parent: string,
				_id: string,
				originalName: string,
				mimeType: string,
				filename: string,
				size: number,
				duration: number,
				userCreated: string,
				createdAt: string
			}
		}
	>,
	type: string,
	sourceFile: {
		children: [],
		parent: string,
		_id: string,
		originalName: string,
		mimeType: string,
		filename: string,
		size: number,
		duration: number,
		userCreated: string,
		createdAt: string
	},
	liveSessionDuration: number,
	createdAt: string,
	updatedAt: string,
	__v: number
}


export interface BatchTranscriptionHistory {
	title: '',
	queue: string,
	status: string,
	formats: Array<String>,
	sampling: string,
	lang: string,
	name: string,
	_id: string,
	webhook: string,
	userCreated: {
		role: string,
		type: string,
		name: string,
		_id: string,
		isBlocked: boolean,
		isDeleted: boolean,
		isVerified: boolean,
		email: string,
		createdAt: string,
		updatedAt: string,
		__v: number,
		forgetPasswordCode: string,
		forgetPasswordCodeSentAt: string
	},
	input: [
		{
			isSubmitted: boolean,
			errorCode: number,
			status: string,
			progress: Array<{
				content: string,
				createdAt: string
			}>,
			_id: string,
			file: {
				children: [],
				parent: string,
				_id: string,
				originalName: string,
				mimeType: string,
				filename: string,
				size: number,
				duration: number,
				userCreated: string,
				createdAt: string
			}
		}
	],
	type: string,
	createdAt: string,
	updatedAt: string,
	__v: number,
	sourceFile: {
		children: [],
		parent: string,
		_id: string,
		originalName: string,
		mimeType: string,
		filename: string,
		size: number,
		duration: number,
		userCreated: string,
		createdAt: string
	}
}

export type TranscriptionHistory = LiveTranscriptionHistory | BatchTranscriptionHistory;


export interface OneUserTranscriptionHistoryResponse {
	history: Array<LiveTranscriptionHistory | BatchTranscriptionHistory>,
	totalHistory: number
}