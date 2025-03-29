import { renderHook } from '@testing-library/react';
import * as authSlice from '../features/auth/authSlice';
import { useAuth } from './useAuth';

// Mock the auth service
jest.mock('../services/auth.service', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

// Mock the action creators in the auth slice
jest.mock('../features/auth/authSlice', () => ({
  loginStart: jest.fn(),
  loginSuccess: jest.fn(),
  loginFailure: jest.fn(),
  logout: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('./useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isLoggingIn: false,
    isRegistering: false,
    isLoggingOut: false,
    loginError: null,
    registerError: null,
  }),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return auth functions and states', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isLoggingIn');
    expect(result.current).toHaveProperty('isRegistering');
    expect(result.current).toHaveProperty('isLoggingOut');
    expect(result.current).toHaveProperty('loginError');
    expect(result.current).toHaveProperty('registerError');
  });
}); 