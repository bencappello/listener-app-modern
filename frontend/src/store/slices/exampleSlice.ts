import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
export interface ExampleState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

// Define the initial state using that type
const initialState: ExampleState = {
  value: 0,
  status: 'idle',
};

export const exampleSlice = createSlice({
  name: 'example', // Name of the slice
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    // Example of setting status (could be used with async thunks)
    setStatus: (state, action: PayloadAction<'idle' | 'loading' | 'failed'>) => {
      state.status = action.payload;
    }
  },
  // You can also define extraReducers for actions defined outside the slice (e.g., thunks)
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchExampleData.pending, (state) => {
  //       state.status = 'loading';
  //     })
  //     .addCase(fetchExampleData.fulfilled, (state, action) => {
  //       state.status = 'idle';
  //       state.value = action.payload;
  //     })
  //     .addCase(fetchExampleData.rejected, (state) => {
  //       state.status = 'failed';
  //     });
  // },
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, setStatus } = exampleSlice.actions;

// Selectors can also be defined here (optional)
// export const selectCount = (state: RootState) => state.example.value;

// Export the reducer function for the slice
export default exampleSlice.reducer; 