import React from 'react';
import { render, screen } from './test-utils/testing-library-utils';
import App from './App';

describe('App Component', () => {
  test('renders app header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Listener App/i);
    expect(headerElement).toBeInTheDocument();
  });
  
  test('renders welcome message', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to Listener App/i);
    expect(welcomeElement).toBeInTheDocument();
  });
  
  test('renders footer', () => {
    render(<App />);
    const footerElement = screen.getByText(/Music Blog Aggregator/i);
    expect(footerElement).toBeInTheDocument();
  });
}); 