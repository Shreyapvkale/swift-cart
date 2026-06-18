import React, { useState, useEffect } from 'react';
import { Shield, Bell, AppWindow, AlertTriangle, Loader2, KeyRound, MonitorSmartphone, X } from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';

export default function Settings() {
  const { 
    sessions, prefs, fetchSessions, fetchPrefs, 
    changePassword, terminateAllSessions, updatePrefs, deleteAccount, loading 
  } = accountStore();

  const [activeSection, setActiveSection] = useState('SECURITY');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 2FA state (UI mock)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // App preferences (UI mock)
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR');
  const [theme, setTheme] = useState('Light');

  // Deletion guard modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchPrefs();
  }, []);

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      uiStore.getState().addToast('Please enter all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      uiStore.getState().addToast('New password and confirm password fields do not match.', 'error');
      return;
    }

    setUpdatingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    setUpdatingPassword(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleTogglePref = async (field, currentValue) => {
    if (!prefs) return;
    const updated = {
      orderUpdates: prefs.orderUpdates,
      promoOffers: prefs.promoOffers,
      newArrivals: prefs.newArrivals,
      restockAlerts: prefs.restockAlerts,
      viaEmail: prefs.viaEmail,
      viaSms: prefs.viaSms,
      viaPush: prefs.viaPush,
      [field]: !currentValue
    };
    await updatePrefs(updated);
  };

  const handleTerminateSessions = async () => {
    if (window.confirm('Are you sure you want to log out all other active sessions and devices?')) {
      await terminateAllSessions();
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (deleteConfirmationText !== 'DELETE') {
      uiStore.getState().addToast('Please type "DELETE" exactly to confirm.', 'error');
      return;
    }

    setDeleting(true);
    const success = await deleteAccount();
    setDeleting(false);
    if (success) {
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 portal-body relative">
      {/* Tab Navigation header */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-2 shadow-sm flex overflow-x-auto no-scrollbar">
        {[
          { label: 'Security & Login', value: 'SECURITY', icon: Shield },
          { label: 'Notification Preferences', value: 'NOTIFICATIONS', icon: Bell },
          { label: 'App Preferences', value: 'APP_PREFS', icon: AppWindow }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveSection(tab.value)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                activeSection === tab.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50/50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: SECURITY */}
      {activeSection === 'SECURITY' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
            <h3 className="portal-heading font-bold text-base flex items-center gap-2 border-b border-gray-100 pb-2">
              <KeyRound size={18} className="text-blue-600" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Confirm New Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                {updatingPassword ? <Loader2 className="animate-spin" size={14} /> : null}
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Active Sessions list */}
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-100 gap-2">
              <h3 className="portal-heading font-bold text-base flex items-center gap-2">
                <MonitorSmartphone size={18} className="text-blue-600" />
                <span>Active Login Sessions</span>
              </h3>
              
              {sessions.length > 0 && (
                <button
                  onClick={handleTerminateSessions}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Log out all other devices
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {loading.sessions ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-gray-450 font-semibold py-4">No other sessions active.</p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 text-xs font-semibold text-gray-600">
                    <div>
                      <h4 className="font-heading font-bold text-gray-800">{session.deviceInfo}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">IP Address: {session.ipAddress}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold flex-shrink-0">
                      Active: {new Date(session.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Two-Factor Authentication UI toggle */}
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="portal-heading font-bold text-base">Two-Factor Authentication (2FA)</h4>
              <p className="text-xs text-gray-450 font-semibold">Enable SMS or Email verification for higher login protection.</p>
            </div>
            
            <button
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                uiStore.getState().addToast(`Two-factor verification simulated ${!twoFactorEnabled ? 'Enabled' : 'Disabled'}.`, 'success');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: NOTIFICATIONS PREFS */}
      {activeSection === 'NOTIFICATIONS' && prefs && (
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-6">
          <h3 className="portal-heading font-bold text-base border-b border-gray-100 pb-2 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <span>Manage Notifications Toggles</span>
          </h3>

          <div className="space-y-6">
            {/* Updates Toggles */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alert channels</h4>
              
              {[
                { label: 'Order status updates', desc: 'Realtime tracking and status updates about order delivery.', field: 'orderUpdates' },
                { label: 'Promotional offers', desc: 'Get discount updates, flash sales and coupon alerts.', field: 'promoOffers' },
                { label: 'New arrivals', desc: 'Get notified when new grocery or fashion brands are added.', field: 'newArrivals' },
                { label: 'Restock notifications', desc: 'Get alerts when items in your wishlist are back in stock.', field: 'restockAlerts' },
              ].map((p) => (
                <div key={p.field} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-gray-800">{p.label}</h5>
                    <p className="text-[10px] text-gray-450 font-medium">{p.desc}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePref(p.field, prefs[p.field])}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
                      prefs[p.field] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ${
                      prefs[p.field] ? 'translate-x-5.5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Channels toggles */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notification Delivery Channels</h4>
              
              {[
                { label: 'Email Notifications', desc: 'Receive invoice details, resets and statements.', field: 'viaEmail' },
                { label: 'SMS Notifications', desc: 'Receive real-time alerts for delivery partner tracking.', field: 'viaSms' },
                { label: 'Push App Notifications', desc: 'Browser flash popups for instant cart alerts.', field: 'viaPush' },
              ].map((p) => (
                <div key={p.field} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-gray-800">{p.label}</h5>
                    <p className="text-[10px] text-gray-450 font-medium">{p.desc}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePref(p.field, prefs[p.field])}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
                      prefs[p.field] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ${
                      prefs[p.field] ? 'translate-x-5.5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: APP PREFS & DANGER ZONE */}
      {activeSection === 'APP_PREFS' && (
        <div className="space-y-6">
          {/* App preferences */}
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
            <h3 className="portal-heading font-bold text-base border-b border-gray-100 pb-2">App Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">App Language</label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    uiStore.getState().addToast(`Language updated to: ${e.target.value}`, 'success');
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                </select>
              </div>

              {/* Currency selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Currency Type</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    uiStore.getState().setCurrency(e.target.value);
                    uiStore.getState().addToast(`Currency updated to: ${e.target.value}`, 'success');
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              {/* Theme toggle */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Appearance Theme</label>
                <select
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    uiStore.getState().addToast(`Theme set to: ${e.target.value}`, 'success');
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  <option value="Light">Light Mode</option>
                  <option value="Dark">Dark Mode</option>
                  <option value="System">System default</option>
                </select>
              </div>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="font-heading font-black text-red-700 flex items-center gap-1.5 text-base">
                <AlertTriangle size={18} />
                <span>Permanently delete SwiftCart account</span>
              </h4>
              <p className="text-xs text-red-600/90 font-medium">
                This is an irreversible operation. Deleting your profile will wipe out your wallet balance, wishlist, and shipping addresses.
              </p>
            </div>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex-shrink-0"
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale border border-red-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h4 className="font-heading font-black text-red-700 text-base">Account Deletion Guard</h4>
              <button onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Are you absolutely sure? Type <span className="font-extrabold text-red-600">DELETE</span> in the box below to permanently terminate your account.
            </p>

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4 pt-2">
              <input 
                type="text" 
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder='Type "DELETE"'
                className="w-full px-4 py-2.5 bg-red-50/20 border border-red-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 text-center uppercase tracking-wider"
                required
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {deleting ? <Loader2 className="animate-spin" size={14} /> : null}
                  <span>Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
