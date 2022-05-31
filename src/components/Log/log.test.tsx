import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from './index';

test('checking login page', () => {
  render(<Login />);
  const linkElement = screen.getByText(/oi/i);
  expect(linkElement).toBeInTheDocument();
});
