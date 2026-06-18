import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Copy, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';

export default function Coupons() {
  const navigate = useNavigate();
  const { coupons, fetchCoupons, validateCoupon, loading } = accountStore();

  const [activeTab, setActiveTab] = useState('AVAILABLE');
  const [checkCode, setCheckCode] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    uiStore.getState().addToast(`Coupon code "${code}" copied to clipboard!`, 'success');
  };

  const handleApplyCoupon = (code) => {
    uiStore.getState().addToast(`Applying coupon "${code}"... Redirecting to cart.`, 'success');
    // Save to local storage or state to pre-apply in checkout
    localStorage.setItem('preAppliedCoupon', code);
    navigate('/cart');
  };

  const handleCheckCoupon = async (e) => {
    e.preventDefault();
    if (!checkCode.trim()) return;

    setChecking(true);
    const result = await validateCoupon(checkCode.trim(), 500); // pass dummy 500 cart amount
    setChecking(false);

    if (result.success) {
      uiStore.getState().addToast(`Valid coupon code! ${result.coupon.code} can be applied on orders above ₹${result.coupon.minOrder}.`, 'success');
      fetchCoupons(); // reload list
    } else {
      uiStore.getState().addToast(result.message || 'Invalid coupon code.', 'error');
    }
  };

  const getCouponsByTab = () => {
    switch (activeTab) {
      case 'AVAILABLE':
        return coupons.available || [];
      case 'HISTORY':
        return coupons.applied || [];
      case 'EXPIRED':
        return coupons.expired || [];
      default:
        return [];
    }
  };

  const displayCoupons = getCouponsByTab();

  return (
    <div className="space-y-8 portal-body">
      {/* 1. Add Coupon Check Input */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
        <h3 className="portal-heading font-bold text-base flex items-center gap-2">
          <Tag size={18} className="text-blue-600" />
          <span>Add & validate Coupon code</span>
        </h3>
        
        <form onSubmit={handleCheckCoupon} className="flex gap-2 max-w-lg">
          <input 
            type="text"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            placeholder="Enter coupon code (e.g. WELCOME10)"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
          />
          <button 
            type="submit"
            disabled={checking}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            {checking ? <Loader2 className="animate-spin" size={14} /> : null}
            <span>Check Coupon</span>
          </button>
        </form>
      </div>

      {/* 2. Coupons Tabs view */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm p-2 flex border-b border-gray-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('AVAILABLE')}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2 -mb-[2px] ${
              activeTab === 'AVAILABLE'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-blue-500'
            }`}
          >
            Available ({coupons.available?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2 -mb-[2px] ${
              activeTab === 'HISTORY'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-blue-500'
            }`}
          >
            Applied History ({coupons.applied?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('EXPIRED')}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all border-b-2 -mb-[2px] ${
              activeTab === 'EXPIRED'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-blue-500'
            }`}
          >
            Expired ({coupons.expired?.length || 0})
          </button>
        </div>

        {/* Coupons listing */}
        {loading.coupons ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-blue-100/50 shadow-sm">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-xs font-semibold text-gray-400 mt-2">Loading coupons...</p>
          </div>
        ) : displayCoupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100/50 p-12 text-center shadow-sm max-w-md mx-auto">
            <Tag size={40} className="mx-auto text-gray-300" />
            <h4 className="portal-heading text-base font-bold mt-4">No coupons available</h4>
            <p className="text-xs text-gray-400 mt-1 font-semibold">
              Check back later for exclusive sales and promotional vouchers!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayCoupons.map((coupon) => {
              // Accent border styles based on tab state
              let accentColorClass = 'bg-blue-600';
              let accentBgClass = 'bg-blue-50/10 border-blue-200';
              let codeColorClass = 'text-blue-600 bg-blue-50 border-blue-100';
              
              if (activeTab === 'HISTORY') {
                accentColorClass = 'bg-emerald-600';
                accentBgClass = 'bg-emerald-50/10 border-emerald-200';
                codeColorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100';
              } else if (activeTab === 'EXPIRED') {
                accentColorClass = 'bg-gray-400';
                accentBgClass = 'bg-gray-50/10 border-gray-200 opacity-60';
                codeColorClass = 'text-gray-500 bg-gray-50 border-gray-150';
              }

              return (
                <div 
                  key={coupon.id}
                  className={`relative portal-card border border-dashed p-6 flex items-start gap-4 overflow-hidden ${accentBgClass}`}
                >
                  {/* Left accent strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${accentColorClass}`}></div>
                  
                  {/* Watermark for Expired Coupons */}
                  {activeTab === 'EXPIRED' && (
                    <div className="absolute right-4 bottom-4 text-4xl font-heading font-black text-gray-200/40 select-none uppercase tracking-widest pointer-events-none transform -rotate-12">
                      Expired
                    </div>
                  )}

                  <div className="flex-1 space-y-4 pl-1">
                    {/* Header info */}
                    <div className="space-y-1.5">
                      <span className={`text-xs font-heading font-black px-2.5 py-0.5 rounded-md border ${codeColorClass}`}>
                        {coupon.code}
                      </span>
                      <p className="text-sm font-heading font-extrabold text-gray-800 pt-2">
                        {coupon.type === 'PERCENT' ? `${coupon.value}% OFF` : `Flat ₹${coupon.value} OFF`}
                        {coupon.maxDiscount && ` up to ₹${coupon.maxDiscount}`}
                      </p>
                      <div className="text-[10px] text-gray-400 font-semibold space-y-0.5">
                        <p>Min Order: ₹{coupon.minOrder}</p>
                        {coupon.expiresAt && (
                          <p>Valid till: {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (only for available coupons) */}
                    {activeTab === 'AVAILABLE' && (
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => handleCopyCode(coupon.code)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:border-blue-500 text-gray-500 hover:text-blue-600 font-bold rounded-lg text-[10px] transition-all bg-white shadow-sm"
                        >
                          <Copy size={12} />
                          <span>Copy Code</span>
                        </button>
                        <button 
                          onClick={() => handleApplyCoupon(coupon.code)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-all shadow-sm"
                        >
                          <span>Apply</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}

                    {/* Meta for applied history */}
                    {activeTab === 'HISTORY' && (
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 pt-2">
                        <Check size={14} />
                        <span>APPLIED ON PREVIOUS PURCHASE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
