import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAdmin: boolean;
  role: 'professor' | 'staff' | null;
  name: string | null;
}

const stored = localStorage.getItem('adminAuth');
const parsed = stored ? JSON.parse(stored) : null;

const initialState: AuthState = {
  isAdmin: parsed?.isAdmin ?? false,
  role: parsed?.role ?? null,
  name: parsed?.name ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdmin(state, action: PayloadAction<{ role: 'professor' | 'staff'; name: string }>) {
      state.isAdmin = true;
      state.role = action.payload.role;
      state.name = action.payload.name;
      localStorage.setItem('adminAuth', JSON.stringify({
        isAdmin: true,
        role: action.payload.role,
        name: action.payload.name,
      }));
    },
    clearAdmin(state) {
      state.isAdmin = false;
      state.role = null;
      state.name = null;
      localStorage.removeItem('adminAuth');
    },
  },
});

export const { setAdmin, clearAdmin } = authSlice.actions;
export default authSlice.reducer;
