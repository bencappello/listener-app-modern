import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '../../types/entities';
import CommentForm from './CommentForm';

// Mock user data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2023-01-01',
  profileImage: 'https://example.com/avatar.jpg'
};

// Mock toast
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => jest.fn(),
  };
});

describe('CommentForm Component', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the comment form', () => {
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
      />
    );
    
    // Check for the presence of the comment input and submit button
    expect(screen.getByTestId('comment-input')).toBeInTheDocument();
    expect(screen.getByTestId('comment-submit')).toBeInTheDocument();
  });
  
  it('calls onSubmit with comment text when form is submitted', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
      />
    );
    
    // Type a comment
    const commentInput = screen.getByTestId('comment-input');
    userEvent.type(commentInput, 'This is a test comment');
    
    // Submit the form
    const submitButton = screen.getByTestId('comment-submit');
    userEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct argument
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('This is a test comment');
    });
  });
  
  it('displays an error when comment is empty', async () => {
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
      />
    );
    
    // Try to submit without entering a comment
    const submitButton = screen.getByTestId('comment-submit');
    
    // Button should be disabled when comment is empty
    expect(submitButton).toBeDisabled();
    
    // Type a space (which will be trimmed)
    const commentInput = screen.getByTestId('comment-input');
    userEvent.type(commentInput, ' ');
    
    // Button should still be disabled
    expect(submitButton).toBeDisabled();
  });
  
  it('disables the form when isDisabled prop is true', () => {
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
        isDisabled={true}
      />
    );
    
    // Both input and button should be disabled
    expect(screen.getByTestId('comment-input')).toBeDisabled();
    expect(screen.getByTestId('comment-submit')).toBeDisabled();
  });
  
  it('disables the form when currentUser is null', () => {
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={null}
      />
    );
    
    // Input should be disabled when user is not logged in
    expect(screen.getByTestId('comment-input')).toBeDisabled();
    expect(screen.getByTestId('comment-submit')).toBeDisabled();
  });
  
  it('clears the input after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
      />
    );
    
    // Type a comment
    const commentInput = screen.getByTestId('comment-input');
    userEvent.type(commentInput, 'This is a test comment');
    
    // Submit the form
    const submitButton = screen.getByTestId('comment-submit');
    userEvent.click(submitButton);
    
    // Check if the input was cleared after submission
    await waitFor(() => {
      expect(commentInput).toHaveValue('');
    });
  });
  
  it('shows error state when submission fails', async () => {
    // Mock the onSubmit function to reject
    const error = new Error('Submission failed');
    mockOnSubmit.mockRejectedValueOnce(error);
    
    // Mock console.error to prevent actual console errors
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
      />
    );
    
    // Type a comment
    const commentInput = screen.getByTestId('comment-input');
    userEvent.type(commentInput, 'This is a test comment');
    
    // Submit the form
    const submitButton = screen.getByTestId('comment-submit');
    userEvent.click(submitButton);
    
    // Check if error handling was triggered
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore the original console.error
    console.error = originalConsoleError;
  });
  
  it('applies custom placeholder text', () => {
    const customPlaceholder = 'Share your thoughts...';
    
    render(
      <CommentForm 
        onSubmit={mockOnSubmit}
        currentUser={mockUser}
        placeholder={customPlaceholder}
      />
    );
    
    const commentInput = screen.getByPlaceholderText(customPlaceholder);
    expect(commentInput).toBeInTheDocument();
  });
}); 