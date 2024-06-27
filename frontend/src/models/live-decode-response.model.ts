
interface OnReadyResponse {
	status: number,
	message: string
}

export interface Hypothesis {
	transcript: string,
	likelihood?: number
}

export interface HypothesisResponse {
	status: number,
	segment: number,
	result: {
		final: boolean,
		hypotheses: Array<Hypothesis>,
	},
	"segment-start"?: number,
	"total-length"?: number,
	id: string
}

export interface AdaptationState {
	id: string,
	value: string,
	type: string,
	time: string
}

export interface AdaptationStateResponse {
	status: number,
	adaptation_state: AdaptationState
	id: string
}

export const isHypothesisResponse = (object: any): object is HypothesisResponse => {
	return !('adaptation_state' in object);
};

/* We receive either of these 2 types of responses */
export type LiveDecodeResponse = HypothesisResponse | AdaptationStateResponse | OnReadyResponse