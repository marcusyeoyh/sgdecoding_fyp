import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "semantic-ui-react";
import { useWindowSize } from "../../helpers/window-resize-hook";
import { MyRecorder, RecordingStates } from "../../pages/user/live-transcribe.page";


interface Props {
	recorder: MyRecorder
}

const VizOscilloscope: React.FC<Props> = ({ recorder }) => {
	const { audioContext, stream, isRecording } = recorder;
	const [mediaError, setMediaError] = useState(false);

	//Because we are using a recursive draw()
	const isRecordingRef = useRef(isRecording);
	const analyserRef = useRef<AnalyserNode>(null!);
	const dataArray = useRef(new Uint8Array());
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>();
	const [winWidth, winHeight] = useWindowSize();


	const draw = useCallback(() => {
		if (canvasRef.current) {
			requestAnimationFrame(draw);
		}

		var bufferLength = analyserRef.current.frequencyBinCount;
		analyserRef.current.getByteTimeDomainData(dataArray.current);

		canvasCtx!.fillStyle = 'rgba(255,255,255,1)';

		if (canvasRef.current) {
			canvasCtx!.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			canvasCtx!.lineWidth = 10;
			if (isRecordingRef.current === RecordingStates.NOT_STARTED) {
				// console.log("[DEBUG] drawing recording not started");
				canvasCtx!.strokeStyle = 'rgba(138, 45, 209, 0.2)';
			} else if (isRecordingRef.current === RecordingStates.STOPPED) {
				// console.log("[DEBUG] drawing recording stopped");
				canvasCtx!.strokeStyle = 'rgba(54, 189, 38, 0.2)';
			} else {
				// console.log("Recording!");
				canvasCtx!.strokeStyle = 'rgba(255, 0, 0, 0.2)';
			}

			canvasCtx!.beginPath();
			var sliceWidth = canvasRef.current.width * 1.0 / bufferLength;
			var x = 0;
			for (var i = 0; i < bufferLength; i++) {
				var v = dataArray.current[i] / 128.0;
				var y = v * canvasRef.current.height / 2;
				if (i === 0) {
					canvasCtx!.moveTo(x, y);
				} else {
					canvasCtx!.lineTo(x, y);
				}
				x += sliceWidth;
			}

			canvasCtx!.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
			canvasCtx!.stroke();
		}
	}, [canvasCtx]);


	useEffect(() => {
		// console.log("[DEBUG] running resize useffect");
		// window.addEventListener('resize', handleResize, false);
		if (canvasRef.current != null) {
			// set the pixels drawn to match the space allocated
			canvasRef.current.height = canvasRef.current.clientHeight;
			canvasRef.current.width = canvasRef.current.clientWidth;
		}
	}, [winWidth, winHeight]);

	useEffect(() => {
		isRecordingRef.current = isRecording;
	}, [isRecording]);

	useEffect(() => {
		if (audioContext !== null && stream !== null) {
			analyserRef.current = audioContext.createAnalyser();
			analyserRef.current.minDecibels = -40;
			analyserRef.current.maxDecibels = 0;
			analyserRef.current.smoothingTimeConstant = 0.9;
			var source: MediaStreamAudioSourceNode;
			var distortion = audioContext.createWaveShaper();
			var gainNode = audioContext.createGain();
			// var biquadFilter = audioContext.createBiquadFilter();
			// var convolver = audioContext.createConvolver();

			analyserRef.current.fftSize = 1024;
			dataArray.current = new Uint8Array(analyserRef.current.frequencyBinCount);

			source = audioContext.createMediaStreamSource(stream);
			if (source.channelCount >= 1) {
				source.connect(analyserRef.current);
				analyserRef.current.connect(distortion);
				gainNode.gain.value = 0;
				distortion.connect(gainNode);
				gainNode.connect(audioContext.destination);
			}

			if (canvasRef.current)
				setCanvasCtx(canvasRef.current.getContext("2d"));

			if (canvasCtx) {
				// console.log("draw() called");
				canvasCtx!.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
				draw();
			}
		}
		else {
			setMediaError(true);
		}

		return () => {
			// console.log("[DEBUG] Oscilloscope unmounted!");
			setCanvasCtx(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasRef.current]);


	return (
		mediaError
			?
			<div style={{ color: '#777' }}>
				<p><Icon name='warning sign'></Icon>Unable to load visualisation</p>
			</div>
			:
			<canvas
				ref={canvasRef as React.MutableRefObject<HTMLCanvasElement | null>}
				style={{ width: '100%', height: '100%', maxHeight: '100px' }}
				role="img"
				aria-label="oscilloscope animation"
			></canvas>
	);
};

export default VizOscilloscope;