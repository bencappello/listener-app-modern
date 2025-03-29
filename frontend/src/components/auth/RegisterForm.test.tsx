import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('RegisterForm', () => {
  const registerMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: registerMock,
      isRegistering: false,
      registerError: null,
    });
  });

  it('renders the registration form', () => {
    render(<RegisterForm />);
    
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submits user registration data', async () => {
    render(<RegisterForm />);
    
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    
    expect(registerMock).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password123',
    });
  });

  it('shows loading state when registration is in progress', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      register: registerMock,
      isRegistering: true,
      registerError: null,
    });
    
    render(<RegisterForm />);
    
    // Verify loading state is shown
    const submitButton = screen.getByRole('button', { name: /registering/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/registering/i)).toBeInTheDocument();
  });

  it('displays error message when registration fails', () => {
    // Mock error state
    (useAuth as jest.Mock).mockReturnValue({
      register: registerMock,
      isRegistering: false,
      registerError: 'Username already exists',
    });
    
    render(<RegisterForm />);
    
    expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<RegisterForm />);
    
    // Submit without entering data
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Validation messages should appear
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Register should not be called
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('validates that passwords match', async () => {
    render(<RegisterForm />);
    
    // Fill form with mismatched passwords
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Validation message for mismatched passwords
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    
    // Register should not be called
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<RegisterForm />);
    
    // Fill form with invalid email
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Validation message for invalid email
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    
    // Register should not be called
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('includes a link to login page', () => {
    render(<RegisterForm />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
}); 