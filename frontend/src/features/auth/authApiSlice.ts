import { apiSlice } from '../api/apiSlice';

// Define the expected response structure for login/register
// Adjust based on your actual backend response
interface AuthResponse {
  access_token: string;
  token_type: string; 
  // Include user details if they are part of the response
  // user: AuthState['user']; 
}

// Define expected request body types
interface LoginCredentials {
  username: string; // Or email
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  username?: string; // Match the RegisterFormValues type
}


export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // Login mutation endpoint
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: credentials => ({
        url: '/auth/login', // Adjust URL based on your backend API routes
        method: 'POST',
        body: credentials, // Usually form data or JSON
      }),
      // We might add tags or invalidation logic here later
    }),
    
    // Register mutation endpoint
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: credentials => ({
        url: '/users/', // Adjust URL for user creation endpoint
        method: 'POST',
        body: credentials,
      }),
    }),
  })
})

// Export hooks for usage in components
export const { useLoginMutation, useRegisterMutation } = authApiSlice; 