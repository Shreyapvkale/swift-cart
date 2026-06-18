import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import authStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = authStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  const autoFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white p-8 rounded-card shadow-subtle border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="font-heading font-extrabold text-3xl text-dark">Welcome Back</h2>
          <p className="text-sm text-mid mt-2">Sign in to track orders and continue shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-btn shadow-subtle hover:shadow-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <LogIn size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-mid">Don't have an account? </span>
          <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
            Sign Up
          </Link>
        </div>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-dark uppercase tracking-wider mb-3 text-center">Demo Quick-Fill Accounts</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => autoFill('customer@swiftcart.com')}
              className="px-3 py-2 bg-primary-light hover:bg-primary/20 text-primary-dark font-bold rounded-btn transition-colors text-center"
            >
              Customer Account
            </button>
            <button
              onClick={() => autoFill('admin@swiftcart.com')}
              className="px-3 py-2 bg-accent-light hover:bg-accent/20 text-accent-dark font-bold rounded-btn transition-colors text-center"
            >
              Admin Portal
            </button>
            <button
              onClick={() => autoFill('agent1@swiftcart.com')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-btn transition-colors text-center"
            >
              Delivery Rider
            </button>
            <button
              onClick={() => autoFill('vendor1@swiftcart.com')}
              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-btn transition-colors text-center"
            >
              Store Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
