import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'; // Import RootState for selectors
// We will import the extended apiSlice later for extraReducers
import { authApiSlice } from './authApiSlice'; 

// Define the shape of the auth state
export interface AuthState {
  user: { id?: string; email?: string; name?: string } | null; // Make user details optional initially
  token: string | null;
  isAuthenticated: boolean;
}

// Define the initial state
const initialState: AuthState = {
  user: null,
  token: null, // Could load token from storage here initially
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to handle setting user credentials after login/registration
    setCredentials: (
      state,
      // Payload now only needs the token, user info comes later if needed
      action: PayloadAction<{ token: string; user?: AuthState['user'] }>
    ) => {
      // If user info is provided in payload, use it. Otherwise, keep existing/null.
      state.user = action.payload.user ?? state.user; 
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    // Reducer to handle logout
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // TODO: Clear token from storage and potentially reset API state
    },
  },
  // Handle API lifecycle actions
  extraReducers: (builder) => {
    builder
      // Match successful login or register
      .addMatcher(
        authApiSlice.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          // Assuming payload is AuthResponse { access_token, token_type }
          // We only store the access_token
          // User details might need a separate fetch or be included in AuthResponse
          state.token = payload.access_token;
          state.isAuthenticated = true;
          // state.user = payload.user; // If user details are included
        }
      )
      // Can add matchers for register if the logic differs, 
      // but if it also just returns a token, the login matcher handles it.
      // .addMatcher(
      //   authApiSlice.endpoints.register.matchFulfilled,
      //   (state, { payload }) => {
      //     state.token = payload.access_token;
      //     state.isAuthenticated = true;
      //   }
      // )
      // Can add matchers for rejected login/register later if needed
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

// Selectors for accessing auth state
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentToken = (state: RootState) => state.auth.token; 