import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders UNotes heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /unotes/i });
  expect(heading).toBeInTheDocument();
});