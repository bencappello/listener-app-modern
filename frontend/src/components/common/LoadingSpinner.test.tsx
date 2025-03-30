import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders a spinner without text by default', () => {
    render(<LoadingSpinner />);
    
    // Check that a spinner exists
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Check that loading text doesn't exist
    expect(screen.queryByTestId('loading-text')).not.toBeInTheDocument();
  });

  it('displays custom text when provided', () => {
    const testText = 'Loading your content...';
    render(<LoadingSpinner text={testText} />);
    
    // Check that the text is displayed
    const textElement = screen.getByTestId('loading-text');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveTextContent(testText);
  });

  it('applies different sizes when specified', () => {
    render(<LoadingSpinner size="xl" />);
    
    // Check that the spinner has the xl size class
    expect(screen.getByTestId('loading-spinner')).toHaveClass('chakra-spinner--xl');
  });

  it('applies custom thickness when specified', () => {
    const customThickness = '8px';
    render(<LoadingSpinner thickness={customThickness} />);
    
    // Check the spinner has the custom thickness style
    expect(screen.getByTestId('loading-spinner')).toHaveStyle(`border-width: ${customThickness}`);
  });

  it('renders with a custom height for the container', () => {
    const customHeight = '400px';
    render(<LoadingSpinner emptyHeight={customHeight} />);
    
    // Check the container has the custom height
    expect(screen.getByTestId('spinner-container')).toHaveStyle(`height: ${customHeight}`);
  });

  it('renders in fullPage mode', () => {
    render(<LoadingSpinner fullPage />);
    
    // In fullPage mode, check for the fullpage container
    const container = screen.getByTestId('fullpage-spinner-container');
    expect(container).toHaveStyle('position: fixed');
    expect(container).toHaveStyle('width: 100vw');
    expect(container).toHaveStyle('height: 100vh');
  });
}); 