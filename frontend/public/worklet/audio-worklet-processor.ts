

/* 
	TODO
*/


/* References */
// https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor


export class MicWorkletProcessor extends AudioWorkletProcessor {
	#socket: WebSocket | null;
	#isRecording: boolean;

	constructor(options: any){
		super();
		this.#socket = null
		this.#isRecording = false
		console.log(options.numberOfInputs)
		console.log(options.processorOptions)
	}

	set socket(soc: WebSocket){
		this.#socket = soc
	}

	get socket(){
		return this.#socket!;
	}

	set isRecording(isRec:boolean){
		this.#isRecording = isRec;
	}

	get isRecording(){
		return this.#isRecording;
	}

	static get parameterDescriptors(){
		return [{
			name: 'test'
		}]
	}

	process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: { [name: string]: Float32Array }): boolean{
		if (this.socket === null) {
      return false;
    }

    if (this.isRecording === true) {
      const [input] = inputs;
      const buffer = new ArrayBuffer(input.length * 2);
      const output = new DataView(buffer);

      for (let i = 0, offset = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, parseInt(input[i].toString())));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }

			console.log({buffer})
      // this.socket.send(buffer);
    }

		return true;	
	}

}


registerProcessor('buffer-detector', MicWorkletProcessor);


