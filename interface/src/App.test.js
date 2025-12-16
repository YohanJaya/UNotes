import { render, screen } from '@testing-library/react';
import App from './App';

test('renders UNotes heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name:  /# unotes/i })).toBeInTheDocument();
});