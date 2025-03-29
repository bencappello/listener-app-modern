import { store, RootState, useAppDispatch, useAppSelector } from './index';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Mock react-redux for the last test
jest.mock('react-redux', () => {
  const originalModule = jest.requireActual('react-redux');
  return {
    ...originalModule,
    useDispatch: jest.fn().mockReturnValue(jest.fn()),
  };
});

describe('Redux Store', () => {
  it('should have the correct initial state', () => {
    const state = store.getState();
    
    // Check if auth state is present and has the right structure
    expect(state).toHaveProperty('auth');
    expect(state.auth).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  it('should provide the correct state type', () => {
    const state: RootState = store.getState();
    // Primarily a type test - will pass if types are correct
    expect(state).toBeTruthy();
  });

  it('should have Redux store configured correctly', () => {
    // This is more of a sanity check for the configuration
    // We can verify that the store has been created successfully
    expect(store).toBeTruthy();
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  // Test typed hooks
  it('should export typed versions of hooks', () => {
    // This is primarily a type check
    // If the types are wrong, TypeScript will fail to compile
    expect(typeof useAppDispatch).toBe('function');
    expect(typeof useAppSelector).toBe('function');
    
    // Check that useAppDispatch is a wrapper around useDispatch
    expect(useAppDispatch.toString()).toContain('useDispatch');
    
    // Verify the hook is callable with our mock
    expect(() => {
      useAppDispatch();
    }).not.toThrow();
  });
}); 