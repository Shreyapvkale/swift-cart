import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Copy, Share2, MessageCircle, Twitter, ArrowRight, Loader2 } from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';

const TRANSACTION_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Credits', value: 'CREDIT' },
  { label: 'Debits', value: 'DEBIT' }
];

export default function WalletView() {
  const navigate = useNavigate();
  const { wallet, transactions, fetchWallet, fetchTransactions, loading } = accountStore();
  const { formatPrice } = uiStore();

  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchWallet();
    fetchTransactions(activeTab);
  }, [activeTab]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(wallet.referrals.code || 'RAHUL2025');
    uiStore.getState().addToast(`Referral code "${wallet.referrals.code || 'RAHUL2025'}" copied to clipboard!`, 'success');
  };

  const handleShare = (platform) => {
    const message = `Use my SwiftCart referral code "${wallet.referrals.code || 'RAHUL2025'}" to get ₹30 off on your first order!`;
    const shareUrl = encodeURIComponent(window.location.origin);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      navigator.clipboard.writeText(`${message} Link: ${window.location.origin}`);
      uiStore.getState().addToast('Referral link copied!', 'success');
    }
  };

  const handleUseAtCheckout = () => {
    uiStore.getState().addToast('Wallet balance will be applied automatically at your next checkout!', 'success');
    navigate('/');
  };

  return (
    <div className="space-y-8 portal-body">
      {/* 1. Balance Card & Referral Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card (Blue gradient background) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-md md:col-span-1 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -left-6 -top-6 w-20 h-20 bg-blue-500/30 rounded-full blur-lg"></div>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-blue-100 font-extrabold text-[10px] uppercase tracking-wider">
              <Wallet size={16} />
              <span>SwiftCart Wallet</span>
            </div>
            <h3 className="font-heading font-black text-3xl pt-2">
              {formatPrice(wallet.balance)}
            </h3>
            <p className="text-xs text-blue-100 font-semibold">Available Balance</p>
          </div>

          <button
            onClick={handleUseAtCheckout}
            className="relative z-10 w-full py-2.5 bg-white hover:bg-gray-100 text-blue-700 font-bold rounded-xl text-xs shadow-md transition-all text-center"
          >
            Use at Checkout
          </button>
        </div>

        {/* Referrals Section */}
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm md:col-span-2 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <h4 className="portal-heading font-bold text-base">Refer & earn rewards</h4>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Invite friends to shop! For every friend who places their first order: You get <span className="text-blue-600 font-bold">₹50 credits</span>, and they get <span className="text-blue-600 font-bold">₹30 off</span>.
            </p>
          </div>

          {/* Referral Code Copy */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Your referral code</span>
              <span className="font-heading font-black text-blue-600 tracking-wider">
                {wallet.referrals.code || 'RAHUL2025'}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl text-xs transition-all bg-white"
            >
              <Copy size={14} />
              <span>Copy Code</span>
            </button>
          </div>

          {/* Share links & stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-50 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Share via</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all shadow-sm"
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={14} className="fill-white" />
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="p-2 bg-sky-450 text-white hover:bg-sky-550 rounded-full transition-all shadow-sm"
                  title="Share on Twitter"
                >
                  <Twitter size={14} className="fill-white" />
                </button>
                <button 
                  onClick={() => handleShare('link')}
                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                  title="Copy share link"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs font-semibold text-gray-650">
              Friends referred: <span className="text-gray-800 font-bold">{wallet.referrals.count}</span> • Earnings: <span className="text-blue-600 font-bold">{formatPrice(wallet.referrals.earnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Transaction History Section */}
      <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden">
        {/* Section header & filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="portal-heading font-bold text-base">Wallet transactions</h3>
          
          <div className="flex bg-gray-50 rounded-lg p-0.75 border border-gray-100">
            {TRANSACTION_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                  activeTab === tab.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {loading.transactions ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-xs font-semibold text-gray-400 mt-2">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs font-bold">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-blue-50/20 text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-center">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  return (
                    <tr key={tx.id} className="hover:bg-blue-50/10">
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{tx.description}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-heading font-black text-sm ${
                        isCredit ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {isCredit ? '+' : '-'}{formatPrice(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
