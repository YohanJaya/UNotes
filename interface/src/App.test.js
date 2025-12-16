import { render, screen } from '@testing-library/react';
import App from './App';

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders UNotes heading', () => {
  render(<App />);
  // Match the exact heading text or use a more flexible query
  expect(screen.getByRole('heading', { name: /# unotes/i })).toBeInTheDocument();
  // OR simply check if "UNotes" text exists anywhere
  // expect(screen.getByText(/unotes/i)).toBeInTheDocument();
});
