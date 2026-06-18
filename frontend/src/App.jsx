import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Package, MapPin, Menu, X, ArrowRight, Store } from 'lucide-react';
import authStore from './store/authStore';
import cartStore from './store/cartStore';
import uiStore from './store/uiStore';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import DoodleBackground from './components/DoodleBackground';
import SearchBar from './components/SearchBar';
import Search from './pages/Search';

// Page Imports
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Portal Page Imports
import PortalLayout from './pages/account/PortalLayout';
import Dashboard from './pages/account/Dashboard';
import OrdersList from './pages/account/OrdersList';
import OrderDetail from './pages/account/OrderDetail';
import Coupons from './pages/account/Coupons';
import Wishlist from './pages/account/Wishlist';
import Addresses from './pages/account/Addresses';
import AccountProfile from './pages/account/Profile';
import Wallet from './pages/account/Wallet';
import Notifications from './pages/account/Notifications';
import Returns from './pages/account/Returns';
import Settings from './pages/account/Settings';

function Navigation() {
  const { user, logout } = authStore();
  const { getCartItemsCount, fetchCart } = cartStore();
  const { currency, setCurrency, formatPrice } = uiStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8 flex-grow">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-11 h-11 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="26" fill="#15803D" />
                <circle cx="50" cy="38" r="11" fill="#FABF14" />
                <path d="M28 68 C28 48, 72 48, 72 68" stroke="white" strokeWidth="6" strokeLinecap="round" />
                <path d="M34 68 H66" stroke="white" strokeWidth="6" strokeLinecap="round" />
                <circle cx="34" cy="74" r="5.5" fill="white" />
                <circle cx="66" cy="74" r="5.5" fill="white" />
              </svg>
              <div className="flex flex-col justify-center select-none">
                <div className="flex items-baseline font-heading font-extrabold text-2xl tracking-tight leading-none">
                  <span className="text-[#15803D]">Swift</span>
                  <span className="text-[#FABF14]">Cart</span>
                </div>
                <span className="text-[9px] font-bold tracking-[0.16em] text-gray-400 mt-1 leading-none">
                  DELIVERED IN MINUTES
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              <Link to="/groceries" className="text-sm font-semibold text-dark hover:text-primary transition-colors">Groceries</Link>
              <Link to="/food" className="text-sm font-semibold text-dark hover:text-primary transition-colors">Food Delivery</Link>
              <Link to="/clothing" className="text-sm font-semibold text-dark hover:text-primary transition-colors">Fashion</Link>
            </div>

            {/* Global Search Bar in Header */}
            <div className="hidden md:block flex-grow max-w-sm lg:max-w-md mx-6">
              <SearchBar placeholder="Search SwiftCart..." className="w-full" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-dark hover:text-primary transition-colors hover:bg-primary-light rounded-btn"
            >
              <ShoppingCart size={22} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User Profile dropdown/links */}
            {user ? (
              <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                <Link to="/account/profile" className="flex items-center gap-2 hover:text-primary group">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover group-hover:border-primary transition-colors"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-dark line-clamp-1">{user.name}</p>
                    <span className="text-[10px] text-primary bg-primary-light font-bold px-1.5 py-0.5 rounded-pill uppercase">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <Link
                  to="/account/orders"
                  className="p-2 text-dark hover:text-primary transition-colors hover:bg-gray-50 rounded-btn"
                  title="My Orders"
                >
                  <Package size={20} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-btn transition-colors"
                  title="Log out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                <Link
                  to="/login"
                  className="text-xs font-bold text-dark hover:text-primary px-3 py-2 rounded-btn transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-primary text-white hover:bg-primary-dark px-3 py-2 rounded-btn shadow-subtle transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="relative flex flex-col min-h-screen bg-lightBg font-body text-dark antialiased">
          <DoodleBackground />
          <div className="relative z-[1] flex flex-col min-h-screen flex-grow">
            <Navigation />
            <main className="relative z-[1] flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/groceries" element={<Home />} />
                <Route path="/food" element={<Home />} />
                <Route path="/clothes" element={<Home />} />
                <Route path="/clothing" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Nested User Account Portal Routes */}
                <Route path="/account" element={<PortalLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="orders" element={<OrdersList />} />
                  <Route path="orders/:orderId" element={<OrderDetail />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="addresses" element={<Addresses />} />
                  <Route path="profile" element={<AccountProfile />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="returns" element={<Returns />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="relative z-[1] bg-dark text-white py-12 mt-12 border-t border-gray-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 100 100" className="w-10 h-10 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" rx="26" fill="#15803D" />
                        <circle cx="50" cy="38" r="11" fill="#FABF14" />
                        <path d="M28 68 C28 48, 72 48, 72 68" stroke="white" strokeWidth="6" strokeLinecap="round" />
                        <path d="M34 68 H66" stroke="white" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="34" cy="74" r="5.5" fill="white" />
                        <circle cx="66" cy="74" r="5.5" fill="white" />
                      </svg>
                      <div className="flex flex-col justify-center select-none">
                        <div className="flex items-baseline font-heading font-extrabold text-xl tracking-tight leading-none">
                          <span className="text-white">Swift</span>
                          <span className="text-[#FABF14]">Cart</span>
                        </div>
                        <span className="text-[8px] font-bold tracking-[0.16em] text-gray-400 mt-1.5 leading-none">
                          DELIVERED IN MINUTES
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Your ultimate quick-commerce superapp. Fresh groceries, delicious hot meals, and the latest clothing collections delivered in minutes.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg mb-4 text-white">Shop Categories</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><Link to="/groceries" className="hover:text-primary transition-colors">Fresh Groceries</Link></li>
                      <li><Link to="/food" className="hover:text-primary transition-colors">Restaurant Hot Food</Link></li>
                      <li><Link to="/clothing" className="hover:text-primary transition-colors">Trendy Fashion</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg mb-4 text-white">Customer Center</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                      <li><Link to="/orders" className="hover:text-primary transition-colors">Track Orders</Link></li>
                      <li><Link to="/cart" className="hover:text-primary transition-colors">My Cart</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg mb-4 text-white">Real-Time Service</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      ⚡ 10-Minute Delivery Guarantee active in Noida Central & West S.F.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-pill border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      System Status: Fully Operational
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500">
                  &copy; {new Date().getFullYear()} SwiftCart Superapp Technologies. All rights reserved.
                </div>
              </div>
            </footer>
          </div>

          {/* Global Toast Alerts */}
          <Toast />
        </div>
      </ErrorBoundary>
    </Router>
  );
}
