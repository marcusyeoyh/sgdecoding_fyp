import { LivetranscribeTypes } from '../types/index';

interface transcriptionEndedAction {
    type: LivetranscribeTypes.ENDED,
	final: string[],
	nonFinal: string
}

	
export type liveTranscribeAction = transcriptionEndedAction;