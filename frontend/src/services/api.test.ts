/**
 * API Client Tests
 */

// First all imports, even though we mock before importing
// We declare the import here but it doesn't actually run until after the mock
import mockApiClient from './api';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the API module directly
jest.mock('./api', () => {
  // We'll create handlers to expose for testing
  let requestInterceptorFn: null | ((config: any) => any) = null;
  let responseErrorInterceptorFn: null | ((error: any) => any) = null;

  // Create a mock axios instance
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: jest.fn((fn) => {
          requestInterceptorFn = fn;
        })
      },
      response: {
        use: jest.fn((_, errorFn) => {
          responseErrorInterceptorFn = errorFn;
        })
      }
    }
  };

  // Export handlers for test access
  return {
    __esModule: true,
    default: mockAxiosInstance,
    _getRequestInterceptor: () => requestInterceptorFn,
    _getResponseErrorInterceptor: () => responseErrorInterceptorFn
  };
});

describe('API Service', () => {
  // TypeScript will complain about these properties, but they exist at runtime
  const apiModule = mockApiClient as any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('adds a request interceptor to include auth token in requests', () => {
    const requestInterceptor = apiModule._getRequestInterceptor();
    expect(requestInterceptor).not.toBeNull();

    if (!requestInterceptor) return;

    // Test with no token
    const config = { headers: {} };
    let result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();

    // Test with token
    localStorageMock.setItem('token', 'test-token');
    result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe('Bearer test-token');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });

  it('handles 401 Unauthorized errors by clearing localStorage', () => {
    const errorInterceptor = apiModule._getResponseErrorInterceptor();
    expect(errorInterceptor).not.toBeNull();

    if (!errorInterceptor) return;

    // Set up localStorage
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', '{"name":"Test User"}');

    // Create a 401 error
    const error = { response: { status: 401 } };

    // Should be rejected but clear localStorage
    try {
      errorInterceptor(error);
    } catch (e) {
      // Expected to reject
    }

    // Check localStorage was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('does not clear localStorage for non-401 errors', () => {
    const errorInterceptor = apiModule._getResponseErrorInterceptor();
    expect(errorInterceptor).not.toBeNull();

    if (!errorInterceptor) return;

    // Set up localStorage
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', '{"name":"Test User"}');

    // Reset mock to clear history
    localStorageMock.removeItem.mockClear();

    // Create a 500 error
    const error = { response: { status: 500 } };

    // Should be rejected but NOT clear localStorage
    try {
      errorInterceptor(error);
    } catch (e) {
      // Expected to reject
    }

    // Check localStorage was NOT cleared
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
}); 