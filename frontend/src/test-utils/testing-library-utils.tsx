import React, { FC, ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

// Create a mock store for testing
const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      // Add more reducers here as needed for tests
    },
    preloadedState
  });
};

// Default mock store
const mockStore = createMockStore();

// Mock ChakraProvider
const MockChakraProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Create a complete mock of QueryClient
const createMockQueryClient = () => ({
  mount: jest.fn(),
  unmount: jest.fn(),
  setDefaultOptions: jest.fn(),
  getDefaultOptions: jest.fn().mockReturnValue({}),
  getQueryCache: jest.fn().mockReturnValue({
    find: jest.fn(),
    findAll: jest.fn(),
    subscribe: jest.fn(),
    clear: jest.fn()
  }),
  getMutationCache: jest.fn().mockReturnValue({
    find: jest.fn(),
    findAll: jest.fn(),
    subscribe: jest.fn(),
    clear: jest.fn()
  }),
  getQueryDefaults: jest.fn(),
  setQueryDefaults: jest.fn(),
  getMutationDefaults: jest.fn(),
  setMutationDefaults: jest.fn(),
  getLogger: jest.fn(),
  setLogger: jest.fn(),
  defaultQueryOptions: jest.fn(options => options),
  defaultMutationOptions: jest.fn(options => options),
  clear: jest.fn(),
  isFetching: jest.fn().mockReturnValue(0),
  isMutating: jest.fn().mockReturnValue(0),
  getDefaultState: jest.fn(),
  resetQueries: jest.fn(),
  cancelQueries: jest.fn(),
  invalidateQueries: jest.fn(),
  refetchQueries: jest.fn(),
  fetchQuery: jest.fn(),
  prefetchQuery: jest.fn(),
  executeMutation: jest.fn()
});

// Create the mock client
const mockQueryClient = createMockQueryClient();

// Mock QueryClientProvider
const MockQueryClientProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// For components that don't need their own router
const AllTheProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MockQueryClientProvider>
      <Provider store={mockStore}>
        <MockChakraProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </MockChakraProvider>
      </Provider>
    </MockQueryClientProvider>
  );
};

// For tests that provide their own router
const AllTheProvidersWithoutRouter: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MockQueryClientProvider>
      <Provider store={mockStore}>
        <MockChakraProvider>
          {children}
        </MockChakraProvider>
      </Provider>
    </MockQueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { useRouter?: boolean },
) => {
  const { useRouter = true, ...renderOptions } = options || {};
  const Wrapper = useRouter ? AllTheProviders : AllTheProvidersWithoutRouter;
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render, createMockStore }; 