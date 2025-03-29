import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError
} from './authSlice';
import { User } from '../../types/auth';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  it('should handle loginStart', () => {
    const nextState = authReducer(initialState, loginStart());
    expect(nextState.isLoading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  it('should handle loginSuccess', () => {
    const startState = {
      ...initialState,
      isLoading: true
    };
    
    const nextState = authReducer(startState, loginSuccess(mockUser));
    
    expect(nextState.isLoading).toBe(false);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(mockUser);
    expect(nextState.error).toBeNull();
  });

  it('should handle loginFailure', () => {
    const startState = {
      ...initialState,
      isLoading: true
    };
    
    const errorMsg = 'Invalid credentials';
    const nextState = authReducer(startState, loginFailure(errorMsg));
    
    expect(nextState.isLoading).toBe(false);
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.error).toBe(errorMsg);
  });

  it('should handle logout', () => {
    const startState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null
    };
    
    const nextState = authReducer(startState, logout());
    
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
  });

  it('should handle updateUser', () => {
    const startState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null
    };
    
    const updatedData = { 
      bio: 'New bio',
      profile_picture: 'http://example.com/avatar.jpg'
    };
    
    const nextState = authReducer(startState, updateUser(updatedData));
    
    expect(nextState.user).toEqual({
      ...mockUser,
      ...updatedData
    });
  });

  it('should not update user if user is null', () => {
    const startState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    };
    
    const updatedData = { bio: 'New bio' };
    const nextState = authReducer(startState, updateUser(updatedData));
    
    expect(nextState.user).toBeNull();
  });

  it('should handle clearError', () => {
    const startState = {
      ...initialState,
      error: 'Some error'
    };
    
    const nextState = authReducer(startState, clearError());
    
    expect(nextState.error).toBeNull();
  });
}); 