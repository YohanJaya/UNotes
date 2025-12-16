import { render, screen } from '@testing-library/react';
import App from './App';

test('renders UNotes heading', () => {
  render(<App />);
  expect(screen.getByText(/unotes/i)).toBeInTheDocument();
});

