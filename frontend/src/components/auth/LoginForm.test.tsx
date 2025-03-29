import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils/testing-library-utils';
import { LoginForm } from './LoginForm';
import { useAuth } from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('LoginForm', () => {
  const loginMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      isLoggingIn: false,
      loginError: null,
    });
  });

  it('renders the login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits user credentials on form submission', async () => {
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(loginMock).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('shows loading state when login is in progress', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      isLoggingIn: true,
      loginError: null,
    });
    
    render(<LoginForm />);
    
    // Verify loading state is shown
    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('displays error message when login fails', () => {
    // Mock error state
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      isLoggingIn: false,
      loginError: 'Invalid credentials',
    });
    
    render(<LoginForm />);
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<LoginForm />);
    
    // Submit without entering data
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Validation messages should appear
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Login should not be called
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('includes a link to register page', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
  });
}); 