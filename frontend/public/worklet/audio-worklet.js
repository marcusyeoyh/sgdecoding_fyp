/**
 * This worklet processes raw pcm bytes in a separate thread to prevent congesting main
 * thread meant for processing ui interactions and DOM.
 */


const quantumSize = 128

// (1/48khz)*128*93 = 248ms (0.25s)
// (1/48khz)*128*37 = 98.6666ms (0.98s)
const quantaPerFrame = 40

const micDefaultSampleRate = 48000
const idealSampleRate = 16000

registerProcessor('audio-processor', class extends AudioWorkletProcessor {
	constructor(options) {
		super()
		// this._webSocket = null;
		this._isRecording = "notstarted";

		this.quantaPerFrame = quantaPerFrame;
		this.quantaCount = 0;

		let bufferSize = quantumSize * this.quantaPerFrame;
		this.frame_32Float = new Float32Array(bufferSize);
		this.frame32FloatDownsampled = [];
		this.frame_16Int = new Int16Array(Math.ceil(bufferSize / (micDefaultSampleRate / idealSampleRate)));

		this.port.onmessage = ({ data }) => {
			const { isRecording } = data;
			console.log("[DEBUG] Audioworklet onmessage, isRecording: " + data.isRecording);
			this.isRecording = isRecording;

			if(isRecording === "stopped"){
				this.port.postMessage({ frame32FloatDownsampled: this.frame32FloatDownsampled });
			}

		}

	}

	get isRecording(){
		return this._isRecording;
	}

	set isRecording(val){
		this._isRecording = val;
	}

	downsampleBuffer = (buffer, sampleRate, newSampleRate) => {
		if (newSampleRate == sampleRate) {
			return buffer;
		}
		if (newSampleRate > sampleRate) {
			throw "new sampling rate is higher than old sampling rate";
		}
		var sampleRateRatio = Math.round(sampleRate / newSampleRate);
		var newLength = Math.round(buffer.length / sampleRateRatio);

		var result = new Float32Array(newLength);
		var offsetResult = 0;
		var offsetBuffer = 0;
		while (offsetResult < result.length) {
			var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
			// Use average value of skipped samples
			var accum = 0, count = 0;
			for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
				accum += buffer[i];
				count++;
			}
			result[offsetResult] = accum / count;
			// Or you can simply get rid of the skipped samples:
			// result[offsetResult] = buffer[nextOffsetBuffer];
			offsetResult++;
			offsetBuffer = nextOffsetBuffer;
		}
		// console.timeEnd("downsampling operation")
		return result;
	}

	process(inputs, outputs, parameters) {
		if (this._isRecording === "inprogress") {
			// console.log("In process(): this._isRecording " + this._isRecording)
			// console.log(sampleRate)
			// console.log(inputs[0][0])
			const offset = quantumSize * this.quantaCount
			inputs[0][0].forEach((sample, idx) => this.frame_32Float[offset + idx] = sample)

			this.quantaCount = this.quantaCount + 1
			if (this.quantaCount === this.quantaPerFrame) {
				// console.time("downsampling operation")
				let downsampled = this.downsampleBuffer(this.frame_32Float, sampleRate, idealSampleRate)
				downsampled.forEach((sample, index) => this.frame_16Int[index] = Math.floor(sample * 0x7FFF))
				this.frame32FloatDownsampled.push(downsampled);
				this.port.postMessage({ frame16Int: this.frame_16Int });
				this.quantaCount = 0
			}
		}
		return true
	}

	static get parameterDescriptors() {
		return [{
			name: 'audio-processor',
		}]
	}


});