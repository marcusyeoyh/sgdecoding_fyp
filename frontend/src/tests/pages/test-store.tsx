import { createStore } from "redux";
import reducers from "../../state/reducers";

export const createTestStore = () => {
	const testStore = createStore(
		reducers
	);

	return testStore;
};