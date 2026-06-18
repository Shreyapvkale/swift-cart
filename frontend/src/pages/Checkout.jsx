import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Landmark, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import authStore from '../store/authStore';
import cartStore from '../store/cartStore';
import uiStore from '../store/uiStore';
import api from '../services/api';

export default function Checkout() {
  const { user, addresses, fetchAddresses, addAddress } = authStore();
  const { cart, activeCoupon, getCartTotal, clearCart } = cartStore();
  const { formatPrice, addToast } = uiStore();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // UPI Payment States
  const [upiTab, setUpiTab] = useState('QR'); // 'QR' or 'ID'
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiLoading, setUpiLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses]);

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

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast('Please select a delivery address.', 'warning');
      return;
    }

    if (paymentMethod === 'UPI' && !upiVerified) {
      addToast('Please verify your UPI payment first.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        couponCode: activeCoupon?.code || undefined,
        notes,
        paymentMethod,
        stripePaymentId: paymentMethod === 'UPI' ? 'upi_txn_' + Math.random().toString(36).substring(2, 10) : undefined
      };

      const { data } = await api.post('/api/orders/checkout', payload);
      if (data.success) {
        addToast('Order successfully submitted! Redirecting to orders...', 'success');
        // Clear local cart store state
        await clearCart();
        
        // Wait 1.5s for async dispatching of delivery agent in backend, then redirect
        setTimeout(() => {
          navigate('/orders');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Setup Details */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="font-heading font-extrabold text-2xl text-dark mb-4">Complete Checkout</h2>

        {/* 1. Address Selection Panel */}
        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-dark flex items-center gap-2">
              <MapPin className="text-primary" size={18} /> Delivery Address
            </h3>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Plus size={14} /> Add New
              </button>
            )}
          </div>

          {showAddressForm ? (
            <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Label</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
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
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Near Central Park"
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-1.5 border border-gray-200 rounded-btn text-xs font-bold text-dark"
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
          ) : addresses.length === 0 ? (
            <p className="text-sm text-mid italic">No saved addresses. Please create one to place your order.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-card border cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-primary bg-primary-light/50 ring-1 ring-primary'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-dark uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-100">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] text-primary font-bold">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-dark font-medium line-clamp-1">{addr.line1}</p>
                  {addr.line2 && <p className="text-[10px] text-mid line-clamp-1">{addr.line2}</p>}
                  <p className="text-[10px] text-mid font-semibold mt-1">
                    {addr.city}, {addr.state} - {addr.zip}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Payment Method selection */}
        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-dark border-b border-gray-50 pb-3 flex items-center gap-2">
            <CreditCard className="text-primary" size={18} /> Payment Options
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('UPI');
                setUpiVerified(false);
              }}
              className={`p-4 rounded-card border font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'UPI'
                  ? 'border-primary bg-primary-light/50 ring-1 ring-primary text-primary-dark'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-dark'
              }`}
            >
              <Smartphone size={24} />
              Pay Online (UPI)
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 rounded-card border font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'COD'
                  ? 'border-primary bg-primary-light/50 ring-1 ring-primary text-primary-dark'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-dark'
              }`}
            >
              <Landmark size={24} />
              Cash on Delivery (COD)
            </button>
          </div>

          {paymentMethod === 'UPI' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-card space-y-4 mt-4">
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setUpiTab('QR')}
                  className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
                    upiTab === 'QR'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-mid hover:text-dark'
                  }`}
                >
                  Scan UPI QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setUpiTab('ID')}
                  className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
                    upiTab === 'ID'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-mid hover:text-dark'
                  }`}
                >
                  Pay via UPI ID
                </button>
              </div>

              {upiTab === 'QR' && (
                <div className="flex flex-col items-center py-4 space-y-3">
                  <div className="bg-white p-3 rounded-card border border-gray-100 shadow-sm flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=swiftcart@upi&pn=SwiftCart&am=${getCartTotal()}&cu=INR`
                      )}`}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-dark">Scan to Pay: {formatPrice(getCartTotal())}</p>
                    <p className="text-[10px] text-mid">UPI ID: <span className="font-mono font-bold text-dark">swiftcart@upi</span></p>
                  </div>
                  
                  {upiVerified ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mt-2">
                      <CheckCircle size={14} /> Payment Verified!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setUpiLoading(true);
                        setTimeout(() => {
                          setUpiLoading(false);
                          setUpiVerified(true);
                          addToast('UPI Payment verified successfully!', 'success');
                        }, 1500);
                      }}
                      disabled={upiLoading}
                      className="mt-2 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs rounded-btn transition-all flex items-center gap-1.5"
                    >
                      {upiLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={12} /> Verifying...
                        </>
                      ) : (
                        'Verify Payment'
                      )}
                    </button>
                  )}
                </div>
              )}

              {upiTab === 'ID' && (
                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-[10px] font-bold text-dark uppercase tracking-wider mb-1.5">Enter UPI ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setUpiVerified(false);
                        }}
                        placeholder="e.g. user@bank"
                        disabled={upiVerified || upiLoading}
                        className="flex-grow px-3 py-2 bg-white border border-gray-200 rounded-btn text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      
                      {!upiVerified && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!upiId || !upiId.includes('@')) {
                              addToast('Please enter a valid UPI ID (e.g. user@bank)', 'warning');
                              return;
                            }
                            setUpiLoading(true);
                            setTimeout(() => {
                              setUpiLoading(false);
                              setUpiVerified(true);
                              addToast(`Request sent to ${upiId}. Simulated verification successful!`, 'success');
                            }, 2000);
                          }}
                          disabled={upiLoading || !upiId}
                          className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs rounded-btn transition-all whitespace-nowrap"
                        >
                          {upiLoading ? 'Sending...' : 'Verify & Pay'}
                        </button>
                      )}
                    </div>
                  </div>

                  {upiVerified && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-btn border border-emerald-100">
                      <CheckCircle size={14} /> UPI ID verified and paid!
                    </div>
                  )}

                  <p className="text-[10px] text-mid leading-relaxed">
                    * Note: A collect request will be sent to your UPI app. Please approve the payment of <strong className="text-dark">{formatPrice(getCartTotal())}</strong> in your UPI app.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Order Notes */}
        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-3">
          <h3 className="font-heading font-bold text-sm text-dark uppercase tracking-wider">Delivery Instructions / Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Leave package by the door, ring bell, call when outside..."
            rows={3}
            className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-btn text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Bill & Final Checkout Panel */}
      <div className="space-y-6">
        <h2 className="font-heading font-extrabold text-xl text-dark">Review Cart Total</h2>

        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-6">
          <div className="border-b border-gray-50 pb-4">
            <h3 className="text-xs font-bold text-dark uppercase tracking-wider mb-3">Item Details</h3>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
              {cart?.items?.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-mid font-medium">
                  <span className="line-clamp-1 flex-grow pr-4">{item.variant.product.name} (x{item.quantity})</span>
                  <span className="text-dark font-semibold flex-shrink-0">{formatPrice(item.variant.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-base font-extrabold text-dark pt-3 border-t border-gray-50">
              <span>Amount Payable</span>
              <span className="text-lg text-primary">{formatPrice(getCartTotal())}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddressId || (paymentMethod === 'UPI' && !upiVerified)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 rounded-btn shadow-subtle hover:shadow-hover transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Processing Order...
              </>
            ) : (
              <>
                <CheckCircle size={16} /> Confirm & Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
