import axios from "axios";
import { store } from "../state";

export const backendSocketURL = process.env.REACT_APP_SOCKETAPI;
const backendBaseURL = process.env.REACT_APP_API ? process.env.REACT_APP_API : "http://localhost:2000";

const proxyAPI = axios.create({
	baseURL : backendBaseURL,
	headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

proxyAPI.interceptors.request.use(
	function (config) {	
		const { token } = store.getState().authReducer;
		if (token) {
			config.headers!['Authorization'] = `Bearer ${token}`;
		}
		config.headers!["Access-Control-Allow-Origin"] = "*";
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);
  
const liveDecodeSocket = (accessToken: string, langModel: string) => {
	return new WebSocket(`${process.env.REACT_APP_LIVE_WSS}/client/ws/speech?content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1&accessToken=${accessToken}&model=${langModel}`);
};

export { proxyAPI, liveDecodeSocket, backendBaseURL };
