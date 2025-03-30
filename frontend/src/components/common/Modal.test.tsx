import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Modal should be in the document
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Modal should not be in the document
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });
  
  it('renders with a title when provided', () => {
    const title = 'Test Modal Title';
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={title}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Title should be visible
    expect(screen.getByTestId('modal-header')).toHaveTextContent(title);
  });
  
  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Close button should be in the document
    const closeButton = screen.getByTestId('modal-close-button');
    expect(closeButton).toBeInTheDocument();
    
    // Click close button
    fireEvent.click(closeButton);
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('calls onSubmit when submit button is clicked', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    // Submit button should be in the document
    const submitButton = screen.getByTestId('modal-submit-button');
    expect(submitButton).toBeInTheDocument();
    
    // Click submit button
    fireEvent.click(submitButton);
    
    // onSubmit should have been called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
  
  it('renders with custom button labels', () => {
    const closeButtonLabel = 'Go Back';
    const submitButtonLabel = 'Confirm';
    
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        closeButtonLabel={closeButtonLabel}
        submitButtonLabel={submitButtonLabel}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    // Buttons should have custom labels
    expect(screen.getByTestId('modal-cancel-button')).toHaveTextContent(closeButtonLabel);
    expect(screen.getByTestId('modal-submit-button')).toHaveTextContent(submitButtonLabel);
  });
  
  it('disables submit button when isSubmitting is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    // Submit button should be disabled
    const submitButton = screen.getByTestId('modal-submit-button');
    expect(submitButton).toHaveAttribute('disabled');
  });
  
  it('does not render the footer when showFooter is false', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        showFooter={false}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    // Footer should not be in the document
    expect(screen.queryByTestId('modal-footer')).not.toBeInTheDocument();
  });
  
  it('renders with custom footer when provided', () => {
    const customFooter = <button data-testid="custom-footer-button">Custom Action</button>;
    
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        footer={customFooter}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    // Custom footer should be in the document
    expect(screen.getByTestId('custom-footer-button')).toBeInTheDocument();
    
    // Default buttons should not be in the document
    expect(screen.queryByTestId('modal-cancel-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-submit-button')).not.toBeInTheDocument();
  });
  
  it('does not render the close button when showCloseButton is false', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        showCloseButton={false}
        onSubmit={mockOnSubmit}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    // Cancel button should not be in the document
    expect(screen.queryByTestId('modal-cancel-button')).not.toBeInTheDocument();
    
    // Submit button should still be in the document
    expect(screen.getByTestId('modal-submit-button')).toBeInTheDocument();
  });
  
  it('renders the modal with children content', () => {
    const childContent = <div data-testid="custom-child">Custom Child Content</div>;
    
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        {childContent}
      </Modal>
    );
    
    // Custom child content should be in the document
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });
}); 