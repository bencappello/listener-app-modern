import { configureStore } from '@reduxjs/toolkit';
import exampleReducer from './slices/exampleSlice'; // Placeholder
import { apiSlice } from '../features/api/apiSlice'; // Import the API slice

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add the API slice reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Add other reducers here
    example: exampleReducer, // Placeholder, can be removed later
    // auth: authReducer,
    // songs: songsReducer,
    // player: playerReducer,
    // etc.
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  // devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {example: ExampleState, ...}
export type AppDispatch = typeof store.dispatch; 