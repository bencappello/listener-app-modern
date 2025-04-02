import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, test, expect, jest } from '@jest/globals';
import LoginForm from './LoginForm'; // Assuming LoginForm.tsx will be created here

// Define the type for the form values
interface LoginFormValues {
  email: string;
  password: string;
}

describe('LoginForm', () => {
  test('renders email and password inputs', () => {
    // Correctly type the mock function
    const mockSubmit = jest.fn<(values: LoginFormValues) => void>();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders a submit button', () => {
    // Correctly type the mock function
    const mockSubmit = jest.fn<(values: LoginFormValues) => void>();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('calls onSubmit with email and password when submitted', () => {
    // Correctly type the mock function
    const handleSubmit = jest.fn<(values: LoginFormValues) => void>();
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
  });

  test('disables submit button when submitting and re-enables after', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
    });
    const handleSubmit = jest.fn<(values: LoginFormValues) => Promise<void>>(
      () => submitPromise
    );
    render(<LoginForm onSubmit={handleSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    expect(submitButton).not.toBeDisabled();

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    // Wait for submitting state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/logging in.../i);
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password123' 
    });

    // Resolve the promise within act
    await act(async () => {
       resolveSubmit(); 
       await submitPromise; // Ensure promise completes within act
    });

    // Wait *outside* act for the state update triggered by promise resolution
    await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent(/login/i);
    });
  });

  // Add more tests later for error display, validation feedback, etc.
}); 