
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NotFoundPage from '../../pages/not-found.page';

test('on wrong navigation, not-found page is displayed', () => {
	const mockInitialEntries = {
		pathname: '/',
		search: 'test_search',
		hash: '5832DBA78AE',
		key: 'test_key',
		state: 'test_state' 
	};

	render(
		<MemoryRouter initialEntries={[mockInitialEntries]}>
			<NotFoundPage />
		</MemoryRouter>
	);

	const notFoundTextEle = screen.getByText(/Page Not Found!/i);
	expect(notFoundTextEle).toBeInTheDocument();
	
});