import { create } from 'zustand';
import api from '../services/api';
import uiStore from './uiStore';

const accountStore = create((set, get) => ({
  summary: null,
  orders: [],
  currentOrder: null,
  deliveryDetails: null,
  coupons: { available: [], expired: [], applied: [] },
  wishlist: [],
  wallet: { balance: 0, referrals: { code: '', count: 0, earnings: 0 } },
  transactions: [],
  notifications: [],
  returns: [],
  sessions: [],
  prefs: null,
  loading: {},

  setLoading: (key, val) => set((state) => ({ loading: { ...state.loading, [key]: val } })),

  // 1. Dashboard Summary
  fetchSummary: async () => {
    get().setLoading('summary', true);
    try {
      const { data } = await api.get('/api/users/me/dashboard-summary');
      if (data.success) {
        set({ summary: data.summary });
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err.message);
    } finally {
      get().setLoading('summary', false);
    }
  },

  // 2. Orders Search & Filters
  fetchOrders: async (status = 'ALL', query = '') => {
    get().setLoading('orders', true);
    try {
      const { data } = await api.get('/api/users/me/orders', {
        params: { status, q: query }
      });
      if (data.success) {
        set({ orders: data.orders });
      }
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      get().setLoading('orders', false);
    }
  },

  // 3. Order Detail & Live Tracking
  fetchOrderDetail: async (id) => {
    get().setLoading('orderDetail', true);
    try {
      const { data } = await api.get(`/api/users/me/orders/${id}`);
      if (data.success) {
        set({ currentOrder: data.order, deliveryDetails: data.deliveryDetails });
      }
    } catch (err) {
      console.error('Error fetching order detail:', err.message);
    } finally {
      get().setLoading('orderDetail', false);
    }
  },

  cancelOrder: async (id) => {
    try {
      const { data } = await api.post(`/api/orders/${id}/cancel`);
      if (data.success) {
        uiStore.getState().addToast('Order cancelled successfully.', 'success');
        get().fetchOrderDetail(id);
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    }
    return false;
  },

  // Reorder all items from previous order into shopping cart
  reorderItems: async (orderItems) => {
    try {
      // Loop through order items and add them to cart
      // cartStore exposes addToCart(variantId, quantity)
      const cartStoreModule = await import('./cartStore');
      const addToCart = cartStoreModule.default.getState().addToCart;
      
      for (const item of orderItems) {
        await addToCart(item.variantId, item.quantity);
      }
      uiStore.getState().addToast('All items added to your cart!', 'success');
      return true;
    } catch (err) {
      uiStore.getState().addToast('Failed to reorder items.', 'error');
    }
    return false;
  },

  // 4. Coupons
  fetchCoupons: async () => {
    get().setLoading('coupons', true);
    try {
      const { data } = await api.get('/api/users/me/coupons');
      if (data.success) {
        set({
          coupons: {
            available: data.available,
            expired: data.expired,
            applied: data.applied
          }
        });
      }
    } catch (err) {
      console.error('Error fetching coupons:', err.message);
    } finally {
      get().setLoading('coupons', false);
    }
  },

  validateCoupon: async (code, subtotal) => {
    try {
      const { data } = await api.post('/api/users/me/coupons/validate', { code, cartSubtotal: subtotal });
      return data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid coupon code.' };
    }
  },

  // 5. Wishlist
  fetchWishlist: async () => {
    get().setLoading('wishlist', true);
    try {
      const { data } = await api.get('/api/users/me/wishlist');
      if (data.success) {
        set({ wishlist: data.wishlist });
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err.message);
    } finally {
      get().setLoading('wishlist', false);
    }
  },

  toggleWishlist: async (productId) => {
    const isWishlisted = get().wishlist.some(item => item.productId === productId);
    try {
      if (isWishlisted) {
        await api.delete(`/api/users/me/wishlist/${productId}`);
        set(state => ({ wishlist: state.wishlist.filter(item => item.productId !== productId) }));
        uiStore.getState().addToast('Item removed from wishlist.', 'info');
      } else {
        const { data } = await api.post(`/api/users/me/wishlist/${productId}`);
        if (data.success) {
          get().fetchWishlist();
          uiStore.getState().addToast('Item added to wishlist.', 'success');
        }
      }
      return true;
    } catch (err) {
      uiStore.getState().addToast('Failed to update wishlist.', 'error');
    }
    return false;
  },

  // 6. Wallet
  fetchWallet: async () => {
    get().setLoading('wallet', true);
    try {
      const { data } = await api.get('/api/users/me/wallet');
      if (data.success) {
        set({ wallet: { balance: data.walletBalance, referrals: data.referrals } });
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err.message);
    } finally {
      get().setLoading('wallet', false);
    }
  },

  fetchTransactions: async (type = 'ALL') => {
    get().setLoading('transactions', true);
    try {
      const { data } = await api.get('/api/users/me/wallet/transactions', { params: { type } });
      if (data.success) {
        set({ transactions: data.transactions });
      }
    } catch (err) {
      console.error('Error fetching wallet transactions:', err.message);
    } finally {
      get().setLoading('transactions', false);
    }
  },

  // 7. Notifications
  fetchNotifications: async () => {
    get().setLoading('notifications', true);
    try {
      const { data } = await api.get('/api/users/me/notifications');
      if (data.success) {
        set({ notifications: data.notifications });
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    } finally {
      get().setLoading('notifications', false);
    }
  },

  markNotificationsRead: async () => {
    try {
      const { data } = await api.put('/api/users/me/notifications/read-all');
      if (data.success) {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        }));
      }
    } catch (err) {
      console.error('Error marking notifications read:', err.message);
    }
  },

  // 8. Returns
  fetchReturns: async () => {
    get().setLoading('returns', true);
    try {
      const { data } = await api.get('/api/users/me/returns');
      if (data.success) {
        set({ returns: data.returns });
      }
    } catch (err) {
      console.error('Error fetching returns:', err.message);
    } finally {
      get().setLoading('returns', false);
    }
  },

  initiateReturn: async (orderId, reason) => {
    try {
      const { data } = await api.post('/api/users/me/returns', { orderId, reason });
      if (data.success) {
        uiStore.getState().addToast('Return request submitted and approved.', 'success');
        get().fetchReturns();
        get().fetchWallet(); // update wallet balance
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast(err.response?.data?.message || 'Failed to submit return request.', 'error');
    }
    return false;
  },

  // 9. Profile Editor
  updatePersonalProfile: async (profileData) => {
    try {
      const { data } = await api.put('/api/users/me/profile', profileData);
      if (data.success) {
        // Sync with local storage user values
        localStorage.setItem('user', JSON.stringify(data.user));
        uiStore.getState().addToast('Profile updated successfully.', 'success');
        // Update user state inside authStore
        const authStoreModule = await import('./authStore');
        authStoreModule.default.setState({ user: data.user });
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to update profile.', 'error');
    }
    return false;
  },

  uploadAvatar: async (avatarUrl) => {
    try {
      const { data } = await api.post('/api/users/me/avatar', { avatarUrl });
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        uiStore.getState().addToast('Profile picture changed.', 'success');
        const authStoreModule = await import('./authStore');
        authStoreModule.default.setState({ user: data.user });
        return data.avatarUrl;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to update profile picture.', 'error');
    }
    return null;
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/api/users/me/password', { currentPassword, newPassword });
      if (data.success) {
        uiStore.getState().addToast('Password changed successfully.', 'success');
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast(err.response?.data?.message || 'Failed to change password.', 'error');
    }
    return false;
  },

  // 10. Sessions
  fetchSessions: async () => {
    get().setLoading('sessions', true);
    try {
      const { data } = await api.get('/api/users/me/sessions');
      if (data.success) {
        set({ sessions: data.sessions });
      }
    } catch (err) {
      console.error('Error fetching sessions:', err.message);
    } finally {
      get().setLoading('sessions', false);
    }
  },

  terminateAllSessions: async () => {
    try {
      const { data } = await api.delete('/api/users/me/sessions/all');
      if (data.success) {
        uiStore.getState().addToast('All other active sessions terminated.', 'success');
        get().fetchSessions();
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to terminate sessions.', 'error');
    }
    return false;
  },

  // 11. Preferences
  fetchPrefs: async () => {
    get().setLoading('prefs', true);
    try {
      const { data } = await api.get('/api/users/me/settings/prefs');
      if (data.success) {
        set({ prefs: data.preferences });
      }
    } catch (err) {
      console.error('Error fetching preferences:', err.message);
    } finally {
      get().setLoading('prefs', false);
    }
  },

  updatePrefs: async (prefsData) => {
    try {
      const { data } = await api.put('/api/users/me/settings/prefs', prefsData);
      if (data.success) {
        set({ prefs: data.preferences });
        uiStore.getState().addToast('Notification preferences updated.', 'success');
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to update preferences.', 'error');
    }
    return false;
  },

  deleteAccount: async () => {
    try {
      const { data } = await api.delete('/api/users/me');
      if (data.success) {
        uiStore.getState().addToast('Account deleted. Goodbye!', 'info');
        const authStoreModule = await import('./authStore');
        authStoreModule.default.getState().logout();
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to delete account.', 'error');
    }
    return false;
  }
}));

export default accountStore;
export { accountStore };
