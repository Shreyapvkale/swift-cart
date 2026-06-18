import React, { useState, useEffect } from 'react';
import { Loader2, Package, MapPin, Truck, HelpCircle, Check, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import authStore from '../store/authStore';
import uiStore from '../store/uiStore';

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PACKED: 'bg-purple-100 text-purple-800 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-amber-100 text-amber-800 border-amber-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  RETURNED: 'bg-rose-100 text-rose-800 border-rose-200'
};

export default function Orders() {
  const { user } = authStore();
  const { formatPrice, addToast } = uiStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      if (data.success) {
        setOrders(data.orders);
        
        // Auto select first order if available
        if (data.orders.length > 0 && !selectedOrder) {
          fetchOrderDetail(data.orders[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const { data } = await api.get(`/api/orders/${orderId}`);
      if (data.success) {
        setSelectedOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load order detail', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await api.post(`/api/orders/${orderId}/cancel`);
      if (data.success) {
        addToast('Order cancelled successfully.', 'info');
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          await fetchOrderDetail(orderId);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    }
  };

  const handleReturnOrder = async (e) => {
    e.preventDefault();
    if (!returnReason) return;
    try {
      const { data } = await api.post(`/api/orders/${selectedOrder.id}/return`, { reason: returnReason });
      if (data.success) {
        addToast('Return request recorded successfully.', 'success');
        setShowReturnModal(false);
        setReturnReason('');
        await fetchOrders();
        await fetchOrderDetail(selectedOrder.id);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to request return.', 'error');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-semibold text-mid">Loading orders history...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. Left: Orders List */}
      <div className="space-y-4">
        <h2 className="font-heading font-extrabold text-2xl text-dark mb-4">My Orders</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-card border border-gray-100 shadow-subtle text-center">
            <Package className="text-gray-300 mx-auto mb-3" size={40} />
            <h4 className="font-heading font-bold text-sm text-dark">No orders placed yet</h4>
            <Link to="/" className="inline-block mt-3 bg-primary text-white text-xs font-bold px-4 py-2 rounded-btn">
              Go to Store
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => fetchOrderDetail(ord.id)}
                className={`p-4 rounded-card border cursor-pointer transition-all ${
                  selectedOrder?.id === ord.id
                    ? 'border-primary bg-primary-light/30 shadow-subtle ring-1 ring-primary'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-mid font-mono">
                    ID: #{ord.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-pill uppercase ${
                    STATUS_COLORS[ord.status] || 'bg-gray-100'
                  }`}>
                    {ord.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-dark">{ord.items?.[0]?.variant?.product?.name || 'Package'}</p>
                {ord.items?.length > 1 && (
                  <p className="text-[10px] text-mid font-semibold">+ {ord.items.length - 1} more items</p>
                )}
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                  <span className="text-xs text-mid">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-extrabold text-primary">{formatPrice(ord.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right: Selected Order Detail Tracker */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="font-heading font-extrabold text-xl text-dark">Order Status Details</h2>

        {selectedOrder ? (
          <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-6">
            
            {/* Header info */}
            <div className="flex flex-wrap justify-between items-start border-b border-gray-50 pb-4 gap-4">
              <div>
                <p className="text-[10px] font-bold text-mid uppercase font-mono">Order ID: #{selectedOrder.id}</p>
                <p className="text-xs text-mid font-semibold mt-1">
                  Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                {selectedOrder.status === 'PLACED' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-btn transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                {selectedOrder.status === 'DELIVERED' && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="bg-accent-light hover:bg-accent/20 text-accent-dark border border-accent/20 text-xs font-bold px-3 py-1.5 rounded-btn transition-colors"
                  >
                    Request Return
                  </button>
                )}
              </div>
            </div>

            {/* Live Delivery Agent Simulation */}
            {selectedOrder.deliveries && selectedOrder.deliveries.length > 0 && (
              <div className="p-4 bg-primary-light border border-primary/20 rounded-card flex gap-4 items-center">
                <Truck className="text-primary flex-shrink-0 animate-bounce" size={24} />
                <div className="flex-grow">
                  <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider">⚡ Quick-Delivery Active</h4>
                  {selectedOrder.deliveries[0].deliveredAt ? (
                    <p className="text-xs text-dark font-medium mt-1">Delivered successfully!</p>
                  ) : (
                    <>
                      <p className="text-xs text-dark font-semibold mt-0.5">
                        Rider: {selectedOrder.deliveries[0].agent?.user?.name || 'Rohan Sharma'} ({selectedOrder.deliveries[0].agent?.vehicleType})
                      </p>
                      <p className="text-[10px] text-mid font-bold mt-1">
                        ETA: Within 20 minutes (Estimate: {new Date(selectedOrder.deliveries[0].estimatedDeliveryTime).toLocaleTimeString()})
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Vertical Progress Tracker */}
            {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'RETURNED' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-dark uppercase tracking-wider">Tracking Timeline</h3>
                
                <div className="flex justify-between relative mt-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = STATUS_STEPS.indexOf(selectedOrder.status);
                    const isCompleted = idx <= currentIdx;
                    
                    return (
                      <div key={step} className="flex flex-col items-center flex-grow text-center relative z-10">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                          isCompleted ? 'bg-primary border-primary text-white' : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? <Check size={14} /> : idx + 1}
                        </div>
                        <span className="text-[10px] font-bold text-dark mt-2 hidden sm:block uppercase">
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-0">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(STATUS_STEPS.indexOf(selectedOrder.status) / (STATUS_STEPS.length - 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Items details */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider mb-3">Items Purchased</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-gray-100 text-dark flex items-center justify-center font-bold text-[10px]">
                        x{item.quantity}
                      </span>
                      <div>
                        <p className="text-dark font-semibold">{item.variant.product.name}</p>
                        {(item.variant.color || item.variant.size) && (
                          <p className="text-[9px] text-mid uppercase font-bold mt-0.5">
                            {item.variant.color && `Color: ${item.variant.color}`} {item.variant.size && `Size: ${item.variant.size}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-dark font-bold">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address & Notes */}
            <div className="border-t border-gray-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-bold text-dark uppercase tracking-wider mb-2">Shipping To</h4>
                {selectedOrder.address ? (
                  <p className="text-mid leading-relaxed font-semibold">
                    {selectedOrder.address.line1}, {selectedOrder.address.line2 && `${selectedOrder.address.line2}, `}
                    {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.zip}
                  </p>
                ) : (
                  <p className="text-mid italic">Address details unavailable.</p>
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-dark uppercase tracking-wider mb-2">Delivery Instructions</h4>
                <p className="text-mid leading-relaxed italic font-medium">
                  {selectedOrder.notes || 'No special delivery instructions provided.'}
                </p>
              </div>
            </div>
            
            {/* Bill Summary */}
            <div className="border-t border-gray-100 pt-6 space-y-2 text-xs">
              <div className="flex justify-between text-mid font-semibold">
                <span>Subtotal</span>
                <span className="text-dark">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-mid font-semibold">
                <span>Delivery Fee</span>
                <span className="text-dark">
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : formatPrice(selectedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-mid font-semibold">
                <span>Taxes (5% GST)</span>
                <span className="text-dark">{formatPrice(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-dark pt-3 border-t border-gray-50">
                <span>Total Paid</span>
                <span className="text-base text-primary">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white p-12 rounded-card border border-gray-100 shadow-subtle text-center text-mid font-semibold">
            Select an order from the list to view its real-time delivery status tracking.
          </div>
        )}
      </div>

      {/* Return Modal Dialog */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-hover border border-gray-100 p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-dark">Request Item Return</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-dark">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Reason for Return</label>
                <textarea
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Size didn't fit, wrong items received, damaged package..."
                  rows={4}
                  className="block w-full p-3 bg-gray-50 border border-gray-200 rounded-btn text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-btn text-xs font-bold text-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-btn text-xs font-bold shadow-subtle hover:bg-primary-dark"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
