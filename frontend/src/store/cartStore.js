import { create } from 'zustand';
import api from '../services/api';
import uiStore from './uiStore';
import authStore from './authStore';

const cartStore = create((set, get) => ({
  cart: null,
  activeCoupon: null,
  loading: false,

  fetchCart: async () => {
    if (!authStore.getState().user) return;
    try {
      const { data } = await api.get('/api/cart');
      if (data.success) {
        set({ cart: data.cart });
      }
    } catch (err) {
      console.error('Failed to retrieve cart details:', err.message);
    }
  },

  addToCart: async (variantId, quantity = 1) => {
    if (!authStore.getState().user) {
      uiStore.getState().addToast('Please login to start shopping!', 'warning');
      return false;
    }
    set({ loading: true });
    try {
      const { data } = await api.post('/api/cart/items', { variantId, quantity });
      if (data.success) {
        set({ cart: data.cart, loading: false });
        uiStore.getState().addToast('Item added to cart!', 'success');
        return true;
      }
    } catch (err) {
      set({ loading: false });
      const msg = err.response?.data?.message || 'Failed to add item.';
      uiStore.getState().addToast(msg, 'error');
      return false;
    }
  },

  updateQuantity: async (itemId, newQty) => {
    try {
      const { data } = await api.put(`/api/cart/items/${itemId}`, { quantity: newQty });
      if (data.success) {
        set({ cart: data.cart });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Quantity update failed.';
      uiStore.getState().addToast(msg, 'error');
      return false;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const { data } = await api.delete(`/api/cart/items/${itemId}`);
      if (data.success) {
        set({ cart: data.cart });
        uiStore.getState().addToast('Item removed from cart.', 'info');
        return true;
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to remove item.', 'error');
      return false;
    }
  },

  clearCart: async () => {
    try {
      const { data } = await api.delete('/api/cart');
      if (data.success) {
        set({ cart: data.cart, activeCoupon: null });
        return true;
      }
    } catch (err) {
      console.error('Failed to clear cart:', err.message);
      return false;
    }
  },

  applyCouponCode: async (code) => {
    const subtotal = get().getCartSubtotal();
    try {
      const { data } = await api.post('/api/cart/apply-coupon', { code, orderSubtotal: subtotal });
      if (data.success) {
        set({ activeCoupon: data.coupon });
        uiStore.getState().addToast(`Promo applied! You saved on this order.`, 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Coupon application failed.';
      uiStore.getState().addToast(msg, 'error');
      return false;
    }
  },

  removeCoupon: () => {
    set({ activeCoupon: null });
    uiStore.getState().addToast('Promo coupon removed.', 'info');
  },

  // State calculations helper
  getCartItemsCount: () => {
    const cart = get().cart;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getCartSubtotal: () => {
    const cart = get().cart;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0);
  },

  getDiscountAmount: () => {
    const coupon = get().activeCoupon;
    const subtotal = get().getCartSubtotal();
    if (!coupon) return 0;

    if (coupon.type === 'PERCENT') {
      const disc = (subtotal * coupon.value) / 100;
      return coupon.maxDiscount && disc > coupon.maxDiscount ? coupon.maxDiscount : disc;
    } else if (coupon.type === 'FLAT') {
      return coupon.value;
    }
    return 0; // FREE_DELIVERY is handled in delivery computation
  },

  getDeliveryFee: () => {
    const coupon = get().activeCoupon;
    const subtotal = get().getCartSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal > 500 || (coupon && coupon.type === 'FREE_DELIVERY')) return 0;
    return 40;
  },

  getTaxAmount: () => {
    const subtotal = get().getCartSubtotal();
    return Math.round(subtotal * 0.05); // 5% standard GST
  },

  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const discount = get().getDiscountAmount();
    const delivery = get().getDeliveryFee();
    const tax = get().getTaxAmount();
    if (subtotal === 0) return 0;
    return subtotal - discount + delivery + tax;
  }
}));

// Load initial cart if logged in
if (localStorage.getItem('accessToken')) {
  cartStore.getState().fetchCart();
}

export default cartStore;
export { cartStore };
