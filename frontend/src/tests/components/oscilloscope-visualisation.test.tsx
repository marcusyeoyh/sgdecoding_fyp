import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { AudioContext } from 'standardized-audio-context-mock';
import VizOscilloscope from '../../components/audio/oscilloscope-visualisation';
import { MyRecorder, RecordingStates } from '../../pages/user/live-transcribe.page';

Object.defineProperty(window, 'MediaStream', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		start: jest.fn(),
		ondataavailable: jest.fn(),
		onerror: jest.fn(),
		state: '',
		stop: jest.fn()
	}))
});


describe('Testing Osciilloscope Visualisation', () => {
	const initialState = { authReducer: { rmbMeEmail: '', token: '' } }
	const mockStore = configureStore([thunk]);
	let store;

	beforeEach(() => {
		// window.AudioContext = mockaudioContext;
		global.AudioContext = AudioContext as any;
	});

	it('Oscilloscope visualisation should not render if no MediaStream or AudioContext present', () => {
		store = mockStore(initialState);

		let mockRecorder: MyRecorder = {
			isMicAccessGiven: false,
			stream: new MediaStream(),
			isRecording: RecordingStates.NOT_STARTED,
			audioContext: null,
			audioWorklet: null,
			errorMsg: '',
		}

		render(
			<Provider store={store}>
				<MemoryRouter>
					<VizOscilloscope recorder={mockRecorder} />
				</MemoryRouter>
			// </Provider>
		);

		expect(screen.getByText('Unable to load visualisation')).toBeVisible();
	});

	it('Oscilloscope visualisation should render', () => {
		store = mockStore(initialState);

		let mockRecorder: MyRecorder = {
			isMicAccessGiven: false,
			stream: new MediaStream(),
			isRecording: RecordingStates.NOT_STARTED,
			audioContext: new (window.AudioContext || window.webkitAudioContext)(),
			audioWorklet: null,
			errorMsg: '',
		}

		render(
			<Provider store={store}>
				<MemoryRouter>
					<VizOscilloscope recorder={mockRecorder} />
				</MemoryRouter>
			// </Provider>
		);

		expect(screen.getByRole('img', { name: 'oscilloscope animation' })).not.toBeNull();

	});
});