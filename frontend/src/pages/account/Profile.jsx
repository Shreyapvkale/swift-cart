import React, { useState, useEffect } from 'react';
import { User, Edit2, Camera, Mail, Phone, Calendar, Users, ShieldCheck, Loader2 } from 'lucide-react';
import authStore from '../../store/authStore';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';

export default function Profile() {
  const { user } = authStore();
  const { updatePersonalProfile, uploadAvatar, loading } = accountStore();
  const { formatPrice } = uiStore();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(user.dob ? new Date(user.dob).toISOString().split('T')[0] : '');
      setGender(user.gender || 'Male');
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'SC';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleAvatarChange = async () => {
    const inputUrl = window.prompt('Enter new Avatar Image URL (simulating Cloudinary upload):');
    if (inputUrl) {
      const updatedUrl = await uploadAvatar(inputUrl);
      if (updatedUrl) {
        uiStore.getState().addToast('Profile picture updated!', 'success');
      }
    }
  };

  const handleVerifyPhone = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    uiStore.getState().addToast(`[SIMULATION OTP] Verification code sent to ${phone}. Code: ${otp}`, 'info');
    const entered = window.prompt(`Enter 6-digit OTP sent to ${phone}:`);
    if (entered === otp) {
      uiStore.getState().addToast('Phone number successfully verified!', 'success');
    } else if (entered !== null) {
      uiStore.getState().addToast('Incorrect OTP. Verification failed.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updatePersonalProfile({
      name,
      phone,
      email,
      dob,
      gender
    });
    if (success) {
      setEditMode(false);
    }
  };

  // Profile Loyalty calculations based on spend
  const totalSpend = 12400; // Mock spend for Gold Members
  const targetSpendForNext = 14000;
  const progressPercent = (totalSpend / targetSpendForNext) * 100;
  const remainingSpend = targetSpendForNext - totalSpend;

  return (
    <div className="space-y-8 portal-body">
      {/* Main card */}
      <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden">
        {/* Banner header top */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700 relative">
          <div className="absolute top-4 right-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/95 backdrop-blur-sm hover:bg-white text-blue-600 font-bold rounded-xl text-xs shadow transition-all hover:scale-105"
              >
                <Edit2 size={13} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-white/80 hover:bg-white text-gray-600 font-bold rounded-xl text-xs shadow transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Avatar content */}
        <div className="px-8 pb-8 relative">
          {/* Avatar overlay */}
          <div className="absolute -top-16 left-8 group">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white flex items-center justify-center font-heading font-extrabold text-3xl text-white shadow-md">
                  {getInitials(user?.name)}
                </div>
              )}
              {/* Trigger change */}
              <button
                onClick={handleAvatarChange}
                className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full border-2 border-white hover:bg-blue-700 shadow transition-all hover:scale-110"
                title="Change Photo"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>

          {/* Spacer for avatar top offset */}
          <div className="h-16"></div>

          {/* Profile form section */}
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              ) : (
                <p className="text-sm font-bold text-gray-800">{name || 'N/A'}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
              {editMode ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800">{email || 'N/A'}</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                    <ShieldCheck size={10} />
                    <span>Verified</span>
                  </span>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
              {editMode ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              ) : (
                <div className="flex items-center justify-between max-w-sm">
                  <p className="text-sm font-bold text-gray-800">{phone || 'N/A'}</p>
                  {phone && (
                    <button
                      type="button"
                      onClick={handleVerifyPhone}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      OTP Verify
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              ) : (
                <p className="text-sm font-bold text-gray-800">
                  {dob ? new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified'}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
              {editMode ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-bold text-gray-800">{gender}</p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 2. Account Statistics and Loyalty Member Tier Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics list */}
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm flex flex-col justify-between gap-4 md:col-span-1">
          <h4 className="portal-heading font-bold text-base border-b border-gray-100 pb-2">Account statistics</h4>
          
          <div className="space-y-3.5 text-xs font-semibold text-gray-600 flex-1 flex flex-col justify-center">
            <div className="flex justify-between">
              <span>Member since</span>
              <span className="text-gray-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'June 2026'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total orders placed</span>
              <span className="text-gray-800">24 orders</span>
            </div>
            <div className="flex justify-between">
              <span>Total spent</span>
              <span className="text-blue-600 font-bold">{formatPrice(totalSpend)}</span>
            </div>
          </div>
        </div>

        {/* Loyalty Tier Progress Card */}
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="text-lg">🥇</span>
            <h4 className="portal-heading font-bold text-base uppercase tracking-wider text-amber-600">Gold Member Tier</h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>Total Spend: {formatPrice(totalSpend)}</span>
              <span>Next tier: Platinum ({formatPrice(targetSpendForNext)})</span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <p className="text-[10px] text-gray-400 font-bold text-center sm:text-left">
              Spent {formatPrice(remainingSpend)} more to unlock premium Platinum rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
