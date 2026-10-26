import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { msg } from './api';
const call = (name, url) => createAsyncThunk(name, async (b, { rejectWithValue }) => { try { return (await api.post(url, b)).data; } catch (e) { return rejectWithValue(msg(e)); } });
export const login = call('auth/login', '/auth/login');
export const register = call('auth/register', '/auth/register');
export const loadMe = createAsyncThunk('auth/me', async () => (await api.get('/auth/me')).data);
const ok = (s, { payload }) => { localStorage.setItem('token', payload.token); s.user = payload.user; s.ready = true; s.loading = false; s.error = null; };
const bad = (s, { payload }) => { s.error = payload; s.loading = false; };
const slice = createSlice({
  name: 'auth', initialState: { user: null, ready: !localStorage.getItem('token'), loading: false, error: null },
  reducers: { logout: s => { localStorage.removeItem('token'); s.user = null; }, clearError: s => { s.error = null; } },
  extraReducers: b => b.addCase(login.pending, s => { s.loading = true; s.error = null; }).addCase(register.pending, s => { s.loading = true; s.error = null; })
    .addCase(login.fulfilled, ok).addCase(register.fulfilled, ok).addCase(login.rejected, bad).addCase(register.rejected, bad)
    .addCase(loadMe.fulfilled, (s, a) => { s.user = a.payload; s.ready = true; })
    .addCase(loadMe.rejected, s => { localStorage.removeItem('token'); s.user = null; s.ready = true; })
});
export const { logout, clearError } = slice.actions;
export default configureStore({ reducer: { auth: slice.reducer } });
