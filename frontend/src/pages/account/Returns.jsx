import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Tag, CornerUpLeft, Plus, X, Loader2, Calendar } from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';
import api from '../../services/api';
import ProductImage from '../../components/ProductImage';

const RETURN_REASONS = [
  'Wrong size / fit issues',
  'Damaged / defective item delivered',
  'Not as described / matches catalog',
  'Changed mind / no longer needed',
  'Other reasons'
];

export default function Returns() {
  const { returns, fetchReturns, initiateReturn, loading } = accountStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const openReturnModal = async () => {
    setLoadingOrders(true);
    setModalOpen(true);
    try {
      const { data } = await api.get('/api/users/me/orders', { params: { status: 'DELIVERED' } });
      if (data.success) {
        setDeliveredOrders(data.orders);
        if (data.orders.length > 0) {
          setSelectedOrderId(data.orders[0].id);
          setSelectedItems([]);
        }
      }
    } catch (err) {
      console.error('Failed to load delivered orders:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderChange = (e) => {
    setSelectedOrderId(e.target.value);
    setSelectedItems([]); // Reset select items
  };

  const toggleItemSelect = (itemId) => {
    setSelectedItems((prev) => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !reason) {
      uiStore.getState().addToast('Please select an order and provide a return reason.', 'error');
      return;
    }

    setSubmitting(true);
    const success = await initiateReturn(selectedOrderId, reason);
    setSubmitting(false);

    if (success) {
      setModalOpen(false);
    }
  };

  // Find currently selected order items
  const currentSelectedOrder = deliveredOrders.find(o => o.id === selectedOrderId);
  const orderItems = currentSelectedOrder ? currentSelectedOrder.items : [];

  return (
    <div className="space-y-6 portal-body relative">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="portal-heading text-lg font-bold">Returns & Refunds</h2>
          <p className="text-xs text-gray-400 font-semibold">
            Track and initiate returns for your delivered purchases.
          </p>
        </div>

        <button
          onClick={openReturnModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
        >
          <Plus size={16} />
          <span>Initiate Return</span>
        </button>
      </div>

      {/* 2. Returns Listing */}
      {loading.returns ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-blue-100/50 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-sm font-semibold text-gray-400 mt-2">Loading returns...</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100/50 p-12 text-center shadow-sm max-w-lg mx-auto">
          <RefreshCw size={40} className="mx-auto text-gray-300 animate-spin" />
          <h4 className="portal-heading text-base font-bold mt-4">No return requests</h4>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            You don't have any active return requests. If you're not satisfied with a delivered item, you can return it within 7 days.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((ret) => {
            const firstItem = ret.order?.items?.[0];
            const product = firstItem?.variant?.product;
            const size = firstItem?.variant?.size;
            const color = firstItem?.variant?.color;
            const price = firstItem?.variant?.price || 0;

            return (
              <div 
                key={ret.id}
                className="bg-white rounded-2xl border border-blue-150/40 p-6 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all duration-200"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-150 pb-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-heading font-black text-gray-800">
                      Return #{ret.id.slice(0, 8).toUpperCase()}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold">
                      Requested on {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • Order #{ret.orderId.slice(0, 8)}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                    {ret.status} • Pickup Scheduled
                  </span>
                </div>

                {/* Body Content */}
                <div className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <ProductImage
                        src={product?.images?.[0]}
                        alt={product ? product.name : 'Product'}
                        category={product?.category?.name || product?.brand || product?.name}
                        heightClass="h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-gray-800">
                        {product ? product.name : 'Item name'}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {color && `${color} • `}{size && `Size ${size} • `}Qty: {firstItem?.quantity || 1}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        Reason: <span className="text-gray-655 font-bold italic">"{ret.reason}"</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Refund Detail */}
                  <div className="sm:text-right flex-shrink-0">
                    <span className="text-[10px] text-gray-400 font-bold">Refund Value</span>
                    <h4 className="font-heading font-black text-base text-emerald-600 mt-1">
                      ₹{ret.refundAmount}
                    </h4>
                  </div>
                </div>

                {/* Refund progress footer */}
                <div className="pt-4 text-xs font-bold text-blue-600 bg-blue-50/20 px-4 py-2 rounded-xl border border-blue-100/20 mt-4">
                  💰 Refund Processed: ₹{ret.refundAmount} credited back to SwiftCart Wallet balance.
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Initiate Return Form Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl z-10 max-w-lg w-full overflow-hidden flex flex-col h-[520px] animate-scale">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="portal-heading font-bold text-lg">Initiate Return Request</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-gray-400 font-semibold mt-2">Loading order contexts...</p>
              </div>
            ) : deliveredOrders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <CornerUpLeft size={32} className="text-gray-300" />
                <h4 className="font-heading font-bold text-sm mt-3">No returnable orders</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Only orders that are in "DELIVERED" status can be returned. Start shopping first!
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-6 px-5 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 space-y-5 flex-1">
                  {/* Select Order */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Select Order</label>
                    <select
                      value={selectedOrderId}
                      onChange={handleOrderChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      {deliveredOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.id.slice(0, 8)} - Placed {new Date(o.createdAt).toLocaleDateString()} (Total: ₹{o.total})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Items checkboxes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Select Items to Return</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {orderItems.map((item) => {
                        const isChecked = selectedItems.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => toggleItemSelect(item.id)}
                            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-blue-500 bg-blue-50/10' 
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div click
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-150 flex-shrink-0">
                               <ProductImage
                                 src={item.variant?.product?.images?.[0]}
                                 alt={item.variant?.product?.name || 'Product'}
                                 category={item.variant?.product?.category?.name || item.variant?.product?.brand || item.variant?.product?.name}
                                 heightClass="h-full"
                               />
                             </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-heading font-bold text-xs text-gray-800 truncate">
                                {item.variant?.product?.name || 'Item'}
                              </h4>
                              <p className="text-[9px] text-gray-450 font-semibold mt-0.5">
                                Qty: {item.quantity} • Value: ₹{item.totalPrice}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Reason */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Return Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      {RETURN_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-650 font-bold rounded-xl text-xs bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={14} /> : null}
                    <span>Submit Return</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
