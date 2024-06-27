import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import App from './App';
import { createTestStore } from './tests/pages/test-store';

var mockStore: any;
beforeAll(() => {
	mockStore = createTestStore();
})

test.skip('renders learn react link', () => {
  render(
		<Provider store={mockStore}>
			<MemoryRouter>
				<App />
			</MemoryRouter>
		</Provider>
		);

  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
