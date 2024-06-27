
export const downsampleBuffer = (buffer: Float32Array, sampleRate: number, rate: number): Float32Array => {
	if (rate === sampleRate) {
		return buffer;
	}
	if (rate > sampleRate) {
		throw new Error("downsampling rate show be smaller than original sample rate");
	}
	var sampleRateRatio = sampleRate / rate;
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
	return result;
};

export interface ConvToWavConfig {
	// desiredSampRate?: number,
	sampleRate: number,
	internalInterleavedLength: number,
	monoChnlBuffer: Array<Float32Array>,
}


export function convertToWAVFile(config: ConvToWavConfig, callback: Function) {
	function mergeAudioBuffers(config: ConvToWavConfig, cb: Function) {
		var leftBuffers = config.monoChnlBuffer.slice(0);
		var sampleRate = config.sampleRate;
		var internalInterleavedLength = config.internalInterleavedLength;
		// var desiredSampRate = config.desiredSampRate;

		var leftBuffersMerged: any;

		leftBuffersMerged = mergeBuffers(leftBuffers, internalInterleavedLength);


		/* combine Array of Float32Arrays into single Float64Array */
		function mergeBuffers(channelBuffer: Array<Float32Array>, rLength: number) {

			var result = new Float64Array(rLength);
			var offset = 0;
			var lng = channelBuffer.length;

			for (var i = 0; i < lng; i++) {
				var buffer = channelBuffer[i];
				result.set(buffer, offset);
				offset += buffer.length;
			}

			return result;
		}

		/* Used for writing WAV headers */
		function writeUTFBytes(view: DataView, offset: number, str: string) {
			var lng = str.length;
			for (var i = 0; i < lng; i++) {
				view.setUint8(offset + i, str.charCodeAt(i));
			}
		}

		// interleave both channels together
		var interleaved: Float64Array;

		interleaved = leftBuffersMerged!;

		var interleavedLength: number = interleaved!.length;

		// create wav file
		var resultingBufferLength = 44 + interleavedLength * 2;

		var buffer = new ArrayBuffer(resultingBufferLength);

		var view = new DataView(buffer);

		writeUTFBytes(view, 0, 'RIFF'); 		// RIFF chunk descriptor/identifier 
		view.setUint32(4, 44 + interleavedLength * 2, true); 	// RIFF chunk length
		writeUTFBytes(view, 8, 'WAVE'); 		// RIFF type 
		writeUTFBytes(view, 12, 'fmt '); 		// Format chunk identifier FMT sub-chunk
		view.setUint32(16, 16, true); 		// format chunk length 
		view.setUint16(20, 1, true); 		// sample format (raw)
		view.setUint16(22, 1, true); 		// mono (1 channel)
		view.setUint32(24, sampleRate, true); // sample rate 
		view.setUint32(28, sampleRate * 2, true); 		// byte rate (sample rate * block align)
		view.setUint16(32, 2, true); 		// block align (channel count * bytes per sample) 
		view.setUint16(34, 16, true); 		// bits per sample 
		writeUTFBytes(view, 36, 'data'); 		// data sub-chunk, data chunk identifier 
		view.setUint32(40, interleavedLength * 2, true); 		// data chunk length 

		// write the PCM samples
		var lng = interleavedLength;
		var index = 44;
		var volume = 1;
		for (var i = 0; i < lng; i++) {
			view.setInt16(index, interleaved![i] * (0x7FFF * volume), true);
			index += 2;
		}

		if (cb) {
			return cb({
				buffer: buffer,
				view: view
			});
		}

		postMessage({
			buffer: buffer,
			view: view
		});
	} // END 

	var workerURL = createWorkerURL(mergeAudioBuffers);
	var webWorker = processInWebWorker(workerURL);
	webWorker.onmessage = function (event) {
		callback(event.data.buffer, event.data.view);

		// release memory
		URL.revokeObjectURL(workerURL);
	};

	webWorker.postMessage(config);
}

function createWorkerURL(_function: Function){
	return URL.createObjectURL(new Blob([_function.toString(),
		';this.onmessage =  function (eee) {' + _function.name + '(eee.data);}'
		], {
			type: 'application/javascript'
		}));
}

function processInWebWorker(workerURL: string) {
	var worker = new Worker(workerURL);
	return worker;
}