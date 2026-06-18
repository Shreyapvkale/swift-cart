import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Tag, Wallet, Heart, ArrowRight, 
  MapPin, MessageSquare, RefreshCw, Compass, Clock 
} from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';
import ProductImage from '../../components/ProductImage';

export default function Dashboard() {
  const navigate = useNavigate();
  const { summary, fetchSummary, loading } = accountStore();
  const { formatPrice } = uiStore();

  useEffect(() => {
    fetchSummary();
  }, []);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSupportClick = () => {
    uiStore.getState().addToast('Support Chat connected! A customer service executive is joining.', 'info');
  };

  if (loading.summary || !summary) {
    return (
      <div className="space-y-8 animate-pulse portal-body">
        {/* Header Shimmer */}
        <div className="h-16 bg-blue-100/60 rounded-xl portal-skeleton"></div>
        {/* KPI Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-blue-100/60 rounded-2xl portal-skeleton"></div>
          ))}
        </div>
        {/* Content Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-blue-100/60 rounded-2xl portal-skeleton"></div>
          <div className="h-80 bg-blue-100/60 rounded-2xl portal-skeleton"></div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = summary.activeOrders?.length || 0;
  const unusedCouponsCount = summary.couponsAvailable || 0;

  return (
    <div className="space-y-8 portal-body">
      {/* 1. Greeting strip */}
      <div className="bg-white rounded-2xl p-6 border border-blue-100/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="portal-heading text-2xl font-extrabold tracking-normal">
            {getGreeting()}, {summary.name?.split(' ')[0] || 'Customer'} 👋
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            You have <span className="text-blue-600 font-bold">{activeOrdersCount} active orders</span> and <span className="text-blue-600 font-bold">{unusedCouponsCount} unused coupons</span>.
          </p>
        </div>
        
        {/* Quick action pills row */}
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => navigate('/account/orders')}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-full text-xs transition-all hover:bg-blue-50/50"
          >
            <Package size={14} />
            <span>Track Order</span>
          </button>
          <button 
            onClick={() => navigate('/account/returns')}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-full text-xs transition-all hover:bg-blue-50/50"
          >
            <RefreshCw size={14} />
            <span>Return Item</span>
          </button>
          <button 
            onClick={handleSupportClick}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-full text-xs transition-all hover:bg-blue-50/50"
          >
            <MessageSquare size={14} />
            <span>Support</span>
          </button>
          <button 
            onClick={() => navigate('/account/addresses')}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-full text-xs transition-all hover:bg-blue-50/50"
          >
            <MapPin size={14} />
            <span>Add Address</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders Card */}
        <div className="portal-card portal-card-hover p-6 border border-blue-50/50 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <h3 className="text-3xl font-heading font-black text-gray-800 mt-2">{summary.totalOrders}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-100">
              <Package size={22} />
            </div>
          </div>
        </div>

        {/* Coupons Available Card */}
        <div className="portal-card portal-card-hover p-6 border border-blue-50/50 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Coupons</p>
              <h3 className="text-3xl font-heading font-black text-gray-800 mt-2">{summary.couponsAvailable}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-100">
              <Tag size={22} />
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="portal-card portal-card-hover p-6 border border-blue-50/50 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Wallet Credit</p>
              <h3 className="text-3xl font-heading font-black text-gray-800 mt-2">{formatPrice(summary.walletBalance)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-100">
              <Wallet size={22} />
            </div>
          </div>
        </div>

        {/* Wishlist Items Card */}
        <div className="portal-card portal-card-hover p-6 border border-blue-50/50 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Wishlist</p>
              <h3 className="text-3xl font-heading font-black text-gray-800 mt-2">{summary.wishlistItemsCount} items</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-100">
              <Heart size={22} className="fill-transparent group-hover:fill-blue-600/10" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Orders & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders Section */}
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-lg">🚚</span>
              <h3 className="portal-heading text-lg font-bold">Active Orders</h3>
            </div>

            {activeOrdersCount === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm font-semibold">No active orders at the moment.</p>
                <Link to="/" className="text-blue-600 text-xs font-bold hover:underline inline-flex items-center gap-1 mt-2">
                  <span>Start shopping</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {summary.activeOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50/30 border border-blue-100/40 rounded-xl gap-4 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2.5 py-0.5 rounded">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1">
                        {order.itemsSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <span className="font-heading font-black text-sm text-gray-800">{formatPrice(order.total)}</span>
                      <button 
                        onClick={() => navigate(`/account/orders/${order.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all transform hover:scale-105 active:scale-95"
                      >
                        <span>Track Order</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="portal-heading text-lg font-bold">Recent Orders</h3>
              <Link 
                to="/account/orders"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {summary.recentOrders?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm font-semibold">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {summary.recentOrders.map((order) => (
                  <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                        <ProductImage
                          src={order.thumbnailUrl}
                          alt={order.productName}
                          category={order.productName}
                          heightClass="h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-sm text-gray-800 truncate">
                          {order.productName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.25 rounded ${
                            order.status === 'DELIVERED' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : order.status === 'CANCELLED' 
                              ? 'bg-red-50 text-red-600' 
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-heading font-black text-sm text-gray-800">{formatPrice(order.total)}</p>
                      <button 
                        onClick={() => navigate(`/account/orders/${order.id}`)}
                        className="text-[10px] text-blue-600 font-bold hover:underline mt-1 block"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Coupons Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="portal-heading text-lg font-bold">Best Offers</h3>
              <Link 
                to="/account/coupons"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {summary.bestCoupons?.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs font-bold">
                No active coupons right now.
              </div>
            ) : (
              <div className="space-y-4">
                {summary.bestCoupons.map((coupon) => (
                  <div 
                    key={coupon.id} 
                    className="relative p-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/10 flex items-start gap-3 overflow-hidden group hover:border-blue-400 transition-all duration-200"
                  >
                    {/* Dash line visual divider */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                    
                    <div className="flex-1 space-y-1 pl-1">
                      <span className="text-xs font-heading font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                        {coupon.code}
                      </span>
                      <p className="text-xs font-bold text-gray-800 pt-1.5">
                        {coupon.type === 'PERCENT' ? `${coupon.value}% OFF` : `Flat ₹${coupon.value} OFF`}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Min. order: ₹{coupon.minOrder}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
