import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, RefreshCw, Eye, Truck } from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';
import useDebounce from '../../hooks/useDebounce';
import ProductImage from '../../components/ProductImage';

const STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Returned', value: 'RETURNED' },
];

export default function OrdersList() {
  const navigate = useNavigate();
  const { orders, fetchOrders, reorderItems, loading } = accountStore();
  const { formatPrice } = uiStore();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    fetchOrders(activeTab, debouncedSearch);
    setVisibleCount(5); // Reset visible count on filter/search change
  }, [activeTab, debouncedSearch]);

  const getStatusBadge = (status) => {
    const uppercase = status.toUpperCase();
    
    switch (uppercase) {
      case 'PLACED':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
            PLACED
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100">
            CONFIRMED
          </span>
        );
      case 'PACKED':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full border border-purple-100">
            PACKED
          </span>
        );
      case 'OUT_FOR_DELIVERY':
      case 'OUT FOR DELIVERY':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-100">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
            OUT FOR DELIVERY
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-100">
            DELIVERED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full border border-red-100">
            CANCELLED
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-gray-150 text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-200">
            RETURNED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold tracking-wider bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded-full border border-gray-150">
            {uppercase}
          </span>
        );
    }
  };

  const handleReorder = async (e, items) => {
    e.preventDefault();
    e.stopPropagation();
    await reorderItems(items);
  };

  const visibleOrders = orders.slice(0, visibleCount);

  return (
    <div className="space-y-6 portal-body">
      {/* Search & Tabs Top Header bar */}
      <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm p-4 sticky top-16 z-20 space-y-4">
        {/* Horizontal sticky filter tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-bold tracking-wide transition-all border-b-2 -mb-[2px] ${
                activeTab === tab.value
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-gray-500 hover:text-blue-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or product name..."
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Orders Catalog Container */}
      {loading.orders ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-2xl border border-blue-100/50 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-sm font-semibold text-gray-500">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100/50 p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="portal-heading text-lg font-bold">No orders found</h3>
          <p className="text-sm text-gray-400 font-semibold mt-2">
            We couldn't find any orders matching your selected filter or query.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleOrders.map((order) => {
            const firstTwoItems = order.items.slice(0, 2);
            const extraItemsCount = order.items.length - 2;

            const isOrderActive = !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status);

            return (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-blue-150/40 shadow-sm overflow-hidden hover:border-blue-300 transition-all duration-200"
              >
                {/* Header bar */}
                <div className="px-6 py-4 bg-blue-50/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150">
                  <div className="space-y-1">
                    <span className="text-xs font-heading font-black text-gray-800">
                      Order #{order.id}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    {/* Item images */}
                    <div className="flex flex-wrap items-center gap-3">
                      {firstTwoItems.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100"
                        >
                           <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                             <ProductImage
                               src={item.variant?.product?.images?.[0]}
                               alt={item.variant?.product?.name || 'Product'}
                               category={item.variant?.product?.category?.name || item.variant?.product?.brand || item.variant?.product?.name}
                               heightClass="h-full"
                             />
                           </div>
                          <div>
                            <h4 className="font-heading font-bold text-xs text-gray-800 line-clamp-1 max-w-[200px]">
                              {item.variant?.product?.name || 'Item'}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              {item.variant.color && `${item.variant.color} • `}{item.variant.size && `${item.variant.size} • `}Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}

                      {extraItemsCount > 0 && (
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold border border-blue-100">
                          + {extraItemsCount} more items
                        </div>
                      )}
                    </div>

                    {/* Total column */}
                    <div className="sm:text-right flex-shrink-0 flex items-center justify-between sm:block border-t border-gray-50 pt-3 sm:border-0 sm:pt-0">
                      <span className="text-xs text-gray-400 font-bold sm:block">Total Amount</span>
                      <span className="font-heading font-black text-lg text-gray-800 sm:block mt-1">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action items */}
                <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <button 
                    onClick={() => navigate(`/account/orders/${order.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 font-bold rounded-lg text-xs transition-all bg-white shadow-sm"
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>

                  <div className="flex gap-2">
                    {isOrderActive && (
                      <button 
                        onClick={() => navigate(`/account/orders/${order.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
                      >
                        <Truck size={14} />
                        <span>Track Order</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => handleReorder(e, order.items)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 hover:border-blue-600 text-blue-600 hover:bg-blue-50/20 font-bold rounded-lg text-xs transition-all bg-white"
                    >
                      <RefreshCw size={14} />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {orders.length > visibleCount && (
            <div className="text-center pt-4">
              <button 
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="px-6 py-2.5 bg-white border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
