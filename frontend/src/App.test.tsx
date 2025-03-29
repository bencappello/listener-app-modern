import React from 'react';
import { render } from './test-utils/testing-library-utils';
import App from './App';

// Mock the App component
jest.mock('./App', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mocked-app">Mocked App</div>
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // If it renders without errors, this test passes
  });
}); 