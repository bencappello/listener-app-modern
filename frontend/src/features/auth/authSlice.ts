import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'; // Import RootState for selectors
// We will import the extended apiSlice later for extraReducers

// Define the shape of the auth state
export interface AuthState {
  user: { id: string; email: string; name?: string } | null; // Or a more detailed user object
  token: string | null;
  isAuthenticated: boolean;
}

// Define the initial state
const initialState: AuthState = {
  user: null,
  token: null, 
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to handle setting user credentials after login/registration
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    // Reducer to handle logout
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  // extraReducers will be added here later to handle API lifecycle actions
  extraReducers: (builder) => {
    // builder.addMatcher(...)
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

// Selectors for accessing auth state
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentToken = (state: RootState) => state.auth.token; 