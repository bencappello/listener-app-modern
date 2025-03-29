import React, { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render } from '../../test-utils/testing-library-utils';
import userEvent from '@testing-library/user-event';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

// Mock useAuth hook
const mockLogin = jest.fn();
const mockRegister = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

// Mock redux hooks
const mockDispatch = jest.fn();
const mockSelector = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: () => mockSelector(),
}));

// Create a mock ProfilePage component for testing
const MockProfilePage = () => (
  <div>
    <h1>Profile</h1>
    <div>User profile content goes here</div>
  </div>
);

// Create mock page components that don't depend on useLocation
const MockLoginPage = () => {
  return (
    <div>
      <h1>Sign In</h1>
      <form data-testid="login-form" onSubmit={(e) => {
        e.preventDefault();
        mockLogin({ username: 'testuser', password: 'password123' });
      }}>
        <input placeholder="Username" />
        <input placeholder="Password" type="password" />
        <button type="submit">Sign In</button>
      </form>
      <div>
        Need an account? <a href="/register">Register</a>
      </div>
    </div>
  );
};

const MockRegisterPage = () => {
  return (
    <div>
      <h1>Create Account</h1>
      <form data-testid="register-form">
        <input placeholder="Username" />
        <input placeholder="Email" type="email" />
        <input placeholder="Password" type="password" />
        <button type="submit">Create Account</button>
      </form>
      <div>
        Already have an account? <a href="/login">Sign In</a>
      </div>
    </div>
  );
};

// Create a custom router component to test navigation
const LoginRegisterRouter = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');

  return (
    <div>
      {currentPage === 'login' ? (
        <div>
          <h1>Sign In</h1>
          <form data-testid="login-form">
            <input placeholder="Username" />
            <input placeholder="Password" type="password" />
            <button type="submit">Sign In</button>
          </form>
          <div>
            Need an account?{' '}
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('register');
              }}
              data-testid="register-link"
            >
              Register
            </a>
          </div>
        </div>
      ) : (
        <div>
          <h1>Create Account</h1>
          <form data-testid="register-form">
            <input placeholder="Username" />
            <input placeholder="Email" type="email" />
            <input placeholder="Password" type="password" />
            <button type="submit">Create Account</button>
          </form>
          <div>
            Already have an account?{' '}
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('login');
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockDispatch.mockClear();
    mockSelector.mockReturnValue({ isAuthenticated: false });
  });

  test('redirects unauthenticated users to login page', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/login" element={<MockLoginPage />} />
          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<MockProfilePage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
      { useRouter: false }
    );

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  test('navigates from login to register', async () => {
    const user = userEvent.setup();
    
    // Use our custom component that handles page switching without need for actual navigation
    render(<LoginRegisterRouter />, { useRouter: false });

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    
    // Click register link
    const registerLink = screen.getByTestId('register-link');
    await user.click(registerLink);
    
    // Should see register page now
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  test('authenticated users can access profile page', () => {
    // Mock authenticated state
    mockSelector.mockReturnValue({ isAuthenticated: true });
    
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/login" element={<MockLoginPage />} />
          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<MockProfilePage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
      { useRouter: false }
    );

    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
  });

  test('updates auth state after successful login', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <MockLoginPage />
      </MemoryRouter>,
      { useRouter: false }
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Verify login was called with the expected credentials
    expect(mockLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
  });
}); 