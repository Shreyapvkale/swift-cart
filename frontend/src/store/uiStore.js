import { create } from 'zustand';

const uiStore = create((set, get) => ({
  toasts: [],
  currency: localStorage.getItem('currency') || 'INR', // INR, USD, EUR
  language: localStorage.getItem('language') || 'EN',   // EN, ES, HI

  // Exchange rates relative to INR (base catalog price)
  exchangeRates: {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
  },

  currencySymbols: {
    INR: '₹',
    USD: '$',
    EUR: '€',
  },

  // Toast manager
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    // Auto delete in 3s
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },

  // Config setters
  setCurrency: (currency) => {
    localStorage.setItem('currency', currency);
    set({ currency });
  },

  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },

  // Price conversion helper
  formatPrice: (amountInINR) => {
    const { currency, exchangeRates, currencySymbols } = get();
    const rate = exchangeRates[currency] || 1;
    const symbol = currencySymbols[currency] || '₹';
    const converted = amountInINR * rate;
    
    // Format nicely
    if (currency === 'INR') {
      return `${symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  }
}));

export default uiStore;
export { uiStore };
