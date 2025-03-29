import React from 'react';
import { render, screen } from '../../test-utils/testing-library-utils';
import AppHeader from './AppHeader';

describe('AppHeader Component', () => {
  test('renders the title', () => {
    render(<AppHeader title="Listener App" />);
    const titleElement = screen.getByTestId('app-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Listener App');
  });
  
  test('renders with different title', () => {
    render(<AppHeader title="Different Title" />);
    const titleElement = screen.getByTestId('app-title');
    expect(titleElement).toHaveTextContent('Different Title');
  });
}); 