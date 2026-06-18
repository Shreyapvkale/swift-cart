import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit, Check, Navigation, Loader2, X } from 'lucide-react';
import authStore from '../../store/authStore';
import uiStore from '../../store/uiStore';
import api from '../../services/api';

export default function Addresses() {
  const { addresses, fetchAddresses, addAddress, deleteAddress } = authStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Form states
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [zip, setZip] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddDrawer = () => {
    setEditingAddress(null);
    setLabel('Home');
    setFullName('');
    setPhone('');
    setLine1('');
    setLine2('');
    setCity('');
    setState('');
    setCountry('India');
    setZip('');
    setLat('');
    setLng('');
    setDrawerOpen(true);
  };

  const openEditDrawer = (addr) => {
    setEditingAddress(addr);
    setLabel(addr.label || 'Home');
    setFullName(addr.fullName || authStore.getState().user?.name || '');
    setPhone(addr.phone || authStore.getState().user?.phone || '');
    setLine1(addr.line1 || '');
    setLine2(addr.line2 || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setCountry(addr.country || 'India');
    setZip(addr.zip || '');
    setLat(addr.lat || '');
    setLng(addr.lng || '');
    setDrawerOpen(true);
  };

  const handleSetDefault = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await api.put(`/api/users/me/addresses/${id}`, { isDefault: true });
      if (data.success) {
        await fetchAddresses();
        uiStore.getState().addToast('Default address updated.', 'success');
      }
    } catch (err) {
      uiStore.getState().addToast('Failed to set default address.', 'error');
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      uiStore.getState().addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setLine1('Detected Location Coordinates');
        setCity('Pune'); // Fill mock values for Pune as sample
        setState('Maharashtra');
        setCountry('India');
        setLoadingLocation(false);
        uiStore.getState().addToast('Location detected successfully!', 'success');
      },
      (error) => {
        setLoadingLocation(false);
        uiStore.getState().addToast('Failed to detect location. Please type manually.', 'error');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !line1 || !city || !zip) {
      uiStore.getState().addToast('Please fill out all required fields.', 'error');
      return;
    }

    const payload = {
      label,
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      country,
      zip,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      isDefault: editingAddress ? editingAddress.isDefault : addresses.length === 0
    };

    let success = false;
    if (editingAddress) {
      try {
        const { data } = await api.put(`/api/users/me/addresses/${editingAddress.id}`, payload);
        if (data.success) {
          await fetchAddresses();
          uiStore.getState().addToast('Address updated successfully.', 'success');
          success = true;
        }
      } catch (err) {
        uiStore.getState().addToast('Failed to update address.', 'error');
      }
    } else {
      success = await addAddress(payload);
    }

    if (success) {
      setDrawerOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this address?')) {
      await deleteAddress(id);
    }
  };

  return (
    <div className="space-y-6 portal-body relative">
      {/* 1. Page Header with limits indicator */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="portal-heading text-lg font-bold">Saved Addresses</h2>
          <p className="text-xs text-gray-400 font-semibold">
            Address limits: <span className="text-blue-600 font-bold">{addresses.length}</span> / 5 saved
          </p>
        </div>

        {addresses.length < 5 ? (
          <button
            onClick={openAddDrawer}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-150 px-3 py-1.5 rounded-xl">
            Maximum address limit reached
          </span>
        )}
      </div>

      {/* 2. Addresses Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div 
            key={addr.id}
            className={`portal-card p-6 border flex flex-col justify-between ${
              addr.isDefault 
                ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                : 'border-blue-50/50'
            }`}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                <span className="text-xs font-heading font-black text-gray-800 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={13} className={addr.isDefault ? 'text-blue-600' : 'text-gray-400'} />
                  <span>{addr.label}</span>
                </span>
                
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                    <Check size={10} />
                    <span>Default</span>
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="text-xs font-semibold text-gray-600 space-y-1.5 leading-relaxed">
                <p className="font-bold text-gray-800 text-sm">{addr.fullName || 'Rahul Sharma'}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} - {addr.zip}</p>
                <p>{addr.country}</p>
                {addr.phone && <p className="text-[10px] text-gray-400 mt-2 font-bold">📞 {addr.phone}</p>}
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-50 mt-6 flex-shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditDrawer(addr)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:border-blue-500 text-gray-500 hover:text-blue-600 font-bold rounded-lg text-[10px] transition-all bg-white"
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-100 hover:border-red-500 text-red-400 hover:text-red-650 font-bold rounded-lg text-[10px] transition-all bg-white"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>

              {!addr.isDefault && (
                <button
                  onClick={(e) => handleSetDefault(e, addr.id)}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Add/Edit Slide-out Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Drawer Body */}
          <div className="relative flex flex-col w-96 max-w-[90%] bg-white h-full shadow-2xl z-10 animate-slide-right overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="portal-heading font-bold text-lg">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Label selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Address Type</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        label === l
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Recipient Name *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Phone *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Geolocation Hook button */}
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={loadingLocation}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 font-bold rounded-xl text-xs transition-all"
              >
                {loadingLocation ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                <span>Detect my location</span>
              </button>

              {/* Address Lines */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 1 *</label>
                <input 
                  type="text" 
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="e.g. 42, MG Road"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 2 (Optional)</label>
                <input 
                  type="text" 
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="e.g. Near Central Park"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">City *</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Pune"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">State *</label>
                  <input 
                    type="text" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ZIP / Postal Code *</label>
                  <input 
                    type="text" 
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="411001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Country *</label>
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Map pin coordinates preview */}
              {lat && lng && (
                <div className="p-3 bg-blue-50/20 border border-dashed border-blue-200 rounded-xl text-[10px] font-bold text-blue-600 flex items-center justify-between">
                  <span>🗺️ Map coordinates resolved</span>
                  <span>{lat}, {lng}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 font-bold rounded-xl text-xs transition-all bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
