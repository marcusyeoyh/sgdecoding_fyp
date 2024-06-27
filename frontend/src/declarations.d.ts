declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext
	}

}

export default global