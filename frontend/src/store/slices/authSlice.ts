import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  isAdmin: boolean;
}

const initialState: AuthState = {
  isAdmin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdmin(state) {
      state.isAdmin = true;
    },
    clearAdmin(state) {
      state.isAdmin = false;
    },
  },
});

export const { setAdmin, clearAdmin } = authSlice.actions;
export default authSlice.reducer;
