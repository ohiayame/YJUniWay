import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAdmin: boolean;
  role: 'professor' | 'staff' | null;
  name: string | null;
  id: number | null;
}

const stored = localStorage.getItem('adminAuth');
const parsed = stored ? JSON.parse(stored) : null;

const initialState: AuthState = {
  isAdmin: parsed?.isAdmin ?? false,
  role: parsed?.role ?? null,
  name: parsed?.name ?? null,
  id: parsed?.id ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdmin(state, action: PayloadAction<{ role: 'professor' | 'staff'; name: string; id: number }>) {
      state.isAdmin = true;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.id = action.payload.id;
      localStorage.setItem('adminAuth', JSON.stringify({
        isAdmin: true,
        role: action.payload.role,
        name: action.payload.name,
        id: action.payload.id,
      }));
    },
    clearAdmin(state) {
      state.isAdmin = false;
      state.role = null;
      state.name = null;
      state.id = null;
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('token');
    },
  },
});

export const { setAdmin, clearAdmin } = authSlice.actions;
export default authSlice.reducer;
