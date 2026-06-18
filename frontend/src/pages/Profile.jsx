import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Trash2, Plus, ShieldCheck, UserCircle2 } from 'lucide-react';
import authStore from '../store/authStore';
import uiStore from '../store/uiStore';

export default function Profile() {
  const { user, addresses, fetchAddresses, addAddress, deleteAddress, updateProfile } = authStore();
  const { addToast } = uiStore();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const ok = await updateProfile(name, phone, avatarUrl);
    setUpdatingProfile(false);
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    const ok = await addAddress({
      label,
      line1,
      line2,
      city,
      state,
      country: 'India',
      zip,
      isDefault: addresses.length === 0
    });

    if (ok) {
      setShowAddressForm(false);
      // Reset form
      setLine1('');
      setLine2('');
      setCity('');
      setState('');
      setZip('');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <h2 className="font-heading font-extrabold text-2xl text-dark mb-4">My Account Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Left: Profile Details & Update Form */}
        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-6 self-start">
          <div className="text-center space-y-3">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
              alt={user.name}
              className="w-24 h-24 rounded-full mx-auto border-2 border-primary object-cover"
            />
            <div>
              <h3 className="font-heading font-extrabold text-lg text-dark">{user.name}</h3>
              <span className="text-[10px] text-primary bg-primary-light font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider">
                {user.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-gray-50">
            <div>
              <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-mid uppercase tracking-wider mb-1">Email (ReadOnly)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-btn text-xs font-semibold text-mid cursor-not-allowed focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-btn text-xs shadow-subtle transition-all disabled:opacity-50"
            >
              {updatingProfile ? 'Saving...' : 'Update Profile Info'}
            </button>
          </form>
        </div>

        {/* 2. Right: Saved Addresses List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-dark flex items-center gap-2">
              <MapPin className="text-primary" size={18} /> Manage Addresses
            </h3>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus size={14} /> Add New Address
              </button>
            )}
          </div>

          {showAddressForm && (
            <form onSubmit={handleCreateAddress} className="space-y-4 p-4 border border-gray-100 rounded-card bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Label</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="201301"
                    className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="B-12, Sector 45"
                  className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Near Central Park"
                  className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Noida"
                    className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Uttar Pradesh"
                    className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-1.5 border border-gray-200 rounded-btn text-xs font-bold text-dark bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-white rounded-btn text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <div className="text-center py-6 text-mid font-semibold italic">
              No addresses saved. Click "Add New Address" to save one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-card border border-gray-200 bg-gray-50 flex justify-between items-start"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-dark uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-150">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] text-primary font-bold">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-dark font-semibold mt-1.5">{addr.line1}</p>
                    {addr.line2 && <p className="text-[10px] text-mid font-semibold">{addr.line2}</p>}
                    <p className="text-[10px] text-mid font-bold">
                      {addr.city}, {addr.state} - {addr.zip}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
