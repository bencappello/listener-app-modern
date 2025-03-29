import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '../features/auth/authSlice';
import { mockAuthState, mockUnauthenticatedState } from './test-fixtures';

// Create a custom render function that includes Redux provider
export function renderWithRedux(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Helper to render with authenticated user
export function renderAuthenticated(
  ui: React.ReactElement,
  renderOptions: RenderOptions = {}
) {
  return renderWithRedux(ui, {
    preloadedState: {
      auth: mockAuthState,
    },
    ...renderOptions,
  });
}

// Helper to render with unauthenticated state
export function renderUnauthenticated(
  ui: React.ReactElement,
  renderOptions: RenderOptions = {}
) {
  return renderWithRedux(ui, {
    preloadedState: {
      auth: mockUnauthenticatedState,
    },
    ...renderOptions,
  });
} 