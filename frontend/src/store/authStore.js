import { create } from 'zustand';
import api from '../services/api';
import uiStore from './uiStore';

const authStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  addresses: [],
  loading: false,

  // Auth Operations
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        set({
          user: data.user,
          accessToken: data.accessToken,
          loading: false
        });

        uiStore.getState().addToast('Welcome back to SwiftCart!', 'success');
        // Fetch addresses post-login
        get().fetchAddresses();
        return { success: true };
      }
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      uiStore.getState().addToast(msg, 'error');
      return { success: false, error: msg };
    }
  },

  register: async (name, email, phone, password, role) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/auth/register', { name, email, phone, password, role });
      set({ loading: false });
      if (data.success) {
        uiStore.getState().addToast('Account created! Please sign in.', 'success');
        return { success: true };
      }
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Registration failed.';
      uiStore.getState().addToast(msg, 'error');
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    const token = localStorage.getItem('refreshToken');
    try {
      await api.post('/api/auth/logout', { token });
    } catch (err) {
      console.warn('Network logout failed, forcing clean sessions:', err.message);
    }
    
    // Purge local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    set({ user: null, accessToken: null, addresses: [] });
    uiStore.getState().addToast('Logged out successfully.', 'info');
  },

  updateProfile: async (name, phone, avatarUrl) => {
    try {
      const { data } = await api.put('/api/users/me', { name, phone, avatarUrl });
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ user: data.user });
        uiStore.getState().addToast('Profile updated.', 'success');
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Profile update failed.', 'error');
      return false;
    }
  },

  // Address Operations
  fetchAddresses: async () => {
    if (!get().user) return;
    try {
      const { data } = await api.get('/api/users/me/addresses');
      if (data.success) {
        set({ addresses: data.addresses });
      }
    } catch (err) {
      console.error('Failed to load address configurations:', err.message);
    }
  },

  addAddress: async (addr) => {
    try {
      const { data } = await api.post('/api/users/me/addresses', addr);
      if (data.success) {
        await get().fetchAddresses();
        uiStore.getState().addToast('New address saved.', 'success');
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to save address.', 'error');
      return false;
    }
  },

  deleteAddress: async (id) => {
    try {
      const { data } = await api.delete(`/api/users/me/addresses/${id}`);
      if (data.success) {
        await get().fetchAddresses();
        uiStore.getState().addToast('Address successfully deleted.', 'info');
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to delete address.', 'error');
      return false;
    }
  }
}));

// Load initial addresses if logged in
if (localStorage.getItem('accessToken')) {
  authStore.getState().fetchAddresses();
}

export default authStore;
export { authStore };
