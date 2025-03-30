import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDisplay, { ErrorSeverity } from './ErrorDisplay';

describe('ErrorDisplay Component', () => {
  const mockOnClose = jest.fn();
  const mockOnRetry = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inline error message correctly', () => {
    const errorMessage = 'Something went wrong';
    render(
      <ErrorDisplay
        message={errorMessage}
        isInline={true}
      />
    );
    
    // Check that the inline error is displayed with the correct message
    const inlineError = screen.getByTestId('inline-error');
    expect(inlineError).toBeInTheDocument();
    expect(inlineError).toHaveTextContent(errorMessage);
  });

  it('renders detailed error with title and message', () => {
    const errorTitle = 'Error Title';
    const errorMessage = 'This is a detailed error message';
    
    render(
      <ErrorDisplay
        title={errorTitle}
        message={errorMessage}
      />
    );
    
    // Check for detailed error display
    const detailedError = screen.getByTestId('detailed-error');
    expect(detailedError).toBeInTheDocument();
    expect(screen.getByText(errorTitle)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders error details when provided', () => {
    const errorDetails = 'Stack trace: Error at line 42';
    
    render(
      <ErrorDisplay
        message="An error occurred"
        details={errorDetails}
      />
    );
    
    // Check that the error details are displayed
    const errorDetailsElement = screen.getByTestId('error-details');
    expect(errorDetailsElement).toBeInTheDocument();
    expect(errorDetailsElement).toHaveTextContent(errorDetails);
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ErrorDisplay
        message="Closable error"
        isClosable={true}
        onClose={mockOnClose}
      />
    );
    
    // Find and click the close button
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry when retry button is clicked', () => {
    render(
      <ErrorDisplay
        message="Retriable error"
        onRetry={mockOnRetry}
      />
    );
    
    // Find and click the retry button
    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);
    
    // Check that onRetry was called
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('applies correct styles for different severity levels', () => {
    const severities: ErrorSeverity[] = ['error', 'warning', 'info'];
    
    // Test each severity
    severities.forEach(severity => {
      const { unmount } = render(
        <ErrorDisplay
          message={`This is a ${severity}`}
          severity={severity}
          isInline={true}
        />
      );
      
      // Check that the alert has the correct status
      const alert = screen.getByTestId('inline-error');
      expect(alert).toHaveAttribute('data-status', severity);
      
      unmount();
    });
  });

  it('uses default title based on severity when title is not provided', () => {
    render(
      <ErrorDisplay
        message="Error without explicit title"
      />
    );
    
    // Should use the default title for errors
    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
  });

  it('applies full width style when specified', () => {
    render(
      <ErrorDisplay
        message="Full width error"
        fullWidth={true}
      />
    );
    
    // Check that the container has width: 100%
    const container = screen.getByTestId('detailed-error');
    expect(container).toHaveStyle('width: 100%');
  });
}); 