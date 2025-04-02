import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL from environment variables or a default
// TODO: Configure environment variables properly later
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1/'; 

// Create the base API slice
export const apiSlice = createApi({
  reducerPath: 'api', // Optional: Specify the slice name in the store
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: [], // Define tag types for caching and invalidation later (e.g., 'User', 'Song', 'Blog')
  endpoints: (builder) => ({
    // Example endpoint: Backend health check
    getHealthCheck: builder.query<{ status: string }, void>({
      query: () => 'health', // Assumes backend has a /api/v1/health endpoint
    }),
    // Define more endpoints here as needed
  }),
});

// Export hooks for usage in components (auto-generated based on endpoints)
export const { useGetHealthCheckQuery } = apiSlice; 