import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, CreditCard, MapPin, 
  Phone, MessageSquare, ShieldAlert, Star, 
  FileText, CornerUpLeft, MessageCircle, AlertTriangle 
} from 'lucide-react';
import accountStore from '../../store/accountStore';
import uiStore from '../../store/uiStore';
import ProductImage from '../../components/ProductImage';

const STEPPER_STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STEP_LABELS = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentOrder, deliveryDetails, fetchOrderDetail, cancelOrder, initiateReturn, loading } = accountStore();
  const { formatPrice } = uiStore();

  useEffect(() => {
    fetchOrderDetail(orderId);
  }, [orderId]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const success = await cancelOrder(orderId);
      if (success) {
        uiStore.getState().addToast('Order cancelled successfully.', 'success');
      }
    }
  };

  const handleReturn = async () => {
    if (window.confirm('Would you like to initiate a return request for this order?')) {
      const success = await initiateReturn(orderId, 'Wrong size / defective item');
      if (success) {
        navigate('/account/returns');
      }
    }
  };

  const handleDownloadInvoice = () => {
    uiStore.getState().addToast('Downloading Invoice PDF...', 'info');
    // Simulate creating a dummy text file as a PDF download
    const docText = `SwiftCart Order Invoice\nOrder ID: ${currentOrder.id}\nTotal Paid: INR ${currentOrder.total}\nPayment Status: PAID\nThank you for shopping with SwiftCart!`;
    const element = document.createElement("a");
    const file = new Blob([docText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `SwiftCart_Invoice_${currentOrder.id.slice(0, 8)}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRateReview = () => {
    uiStore.getState().addToast('Opening Review Wizard... Rate your purchase!', 'success');
  };

  const handleHelp = () => {
    uiStore.getState().addToast('Customer support chat session started. Resolving Order issues.', 'info');
  };

  if (loading.orderDetail || !currentOrder) {
    return (
      <div className="space-y-6 animate-pulse portal-body">
        <div className="h-10 w-40 bg-blue-100/60 rounded-xl portal-skeleton"></div>
        <div className="h-48 bg-blue-100/60 rounded-2xl portal-skeleton"></div>
        <div className="h-64 bg-blue-100/60 rounded-2xl portal-skeleton"></div>
      </div>
    );
  }

  // Determine stepper index
  const currentStepIndex = STEPPER_STEPS.indexOf(currentOrder.status);
  const isCancelled = currentOrder.status === 'CANCELLED';
  const isReturned = currentOrder.status === 'RETURNED';

  // Live map details (if active and agent is assigned)
  const isTrackingActive = !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(currentOrder.status);

  return (
    <div className="space-y-8 portal-body">
      {/* Back link */}
      <button 
        onClick={() => navigate('/account/orders')}
        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to My Orders</span>
      </button>

      {/* 1. Header receipt strip */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Receipt context
          </span>
          <h2 className="portal-heading text-xl font-extrabold text-gray-800">
            Order #{currentOrder.id}
          </h2>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400 font-semibold pt-1">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(currentOrder.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <CreditCard size={13} />
              {currentOrder.paymentStatus} • {currentOrder.notes || 'UPI / Card'}
            </span>
          </div>
        </div>

        <div className="text-left md:text-right border-t border-gray-100 pt-4 md:border-t-0 md:pt-0">
          <p className="text-xs text-gray-400 font-bold">Grand Total Paid</p>
          <p className="font-heading font-black text-2xl text-blue-600 mt-1">
            {formatPrice(currentOrder.total)}
          </p>
        </div>
      </div>

      {/* 2. Live tracking layout (if tracking is active) */}
      {isTrackingActive && deliveryDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated Map Container */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-150/40 shadow-sm overflow-hidden flex flex-col h-[320px] relative">
            <div className="absolute inset-0 bg-blue-50/20 overflow-hidden flex items-center justify-center">
              {/* SVG Map Grid Layout simulator */}
              <svg className="w-full h-full stroke-blue-100/80 fill-none" viewBox="0 0 400 250">
                <rect width="400" height="250" fill="#f8fafc" />
                <circle cx="200" cy="120" r="100" className="stroke-blue-50 fill-blue-50/10" />
                <path d="M0,50 L400,50 M0,150 L400,150 M100,0 L100,250 M300,0 L300,250 M50,50 Q100,100 200,50 T350,50" strokeWidth="4" />
                {/* User node */}
                <circle cx="250" cy="80" r="8" fill="#2563EB" />
                <circle cx="250" cy="80" r="16" className="stroke-blue-500/30 animate-pulse fill-none" strokeWidth="2" />
                
                {/* Delivery agent route line */}
                <path d="M120,180 L200,150 L250,80" stroke="#2563EB" strokeWidth="3" strokeDasharray="5,5" />
                
                {/* Delivery agent node */}
                <g className="animate-bounce" style={{ transformOrigin: '200px 150px' }}>
                  <circle cx="200" cy="150" r="6" fill="#FF6B35" />
                  <path d="M200,150 L195,135 Q200,130 205,135 Z" fill="#FF6B35" />
                </g>
              </svg>
            </div>
            
            {/* Overlay Map tag */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 border border-blue-100 rounded-lg shadow-sm text-[10px] font-bold text-blue-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>LIVE TRACKING ACTIVE</span>
            </div>
          </div>

          {/* Delivery Agent Card details */}
          <div className="bg-white rounded-2xl border border-blue-150/40 p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={deliveryDetails.agent?.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={deliveryDetails.agent?.user?.name}
                  className="w-14 h-14 rounded-full object-cover border border-blue-100"
                />
                <div>
                  <h4 className="font-heading font-bold text-gray-800">{deliveryDetails.agent?.user?.name || 'Arjun'}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Delivery Partner</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="fill-amber-400 stroke-none" size={13} />
                    <span className="text-xs font-bold text-gray-700">{deliveryDetails.agent?.rating || '4.8'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/20 text-xs text-blue-800 font-semibold space-y-1">
                <p>📍 ETA: {Math.max(4, Math.round((new Date(deliveryDetails.estimatedDeliveryTime) - new Date()) / 60000))} minutes</p>
                <p className="text-[10px] text-gray-400 font-medium">Distance remaining: 1.2 km</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button 
                onClick={() => uiStore.getState().addToast(`Calling delivery partner ${deliveryDetails.agent?.user?.name || 'Arjun'}...`, 'info')}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-550 border border-blue-200 text-blue-600 hover:border-blue-500 font-bold rounded-xl text-xs transition-all bg-white"
              >
                <Phone size={14} />
                <span>Call Partner</span>
              </button>
              <button 
                onClick={() => uiStore.getState().addToast('Chat room opened with partner Arjun.', 'info')}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                <MessageSquare size={14} />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Status Stepper */}
      {!isCancelled && !isReturned && (
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-6">
          <h3 className="portal-heading font-bold text-base">Delivery status timeline</h3>
          
          {/* Desktop horizontal stepper */}
          <div className="hidden md:flex items-center justify-between relative px-8 py-4">
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
            
            {STEPPER_STEPS.map((step, index) => {
              const label = STEP_LABELS[step];
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              // Color path calculation
              const linePercentWidth = (currentStepIndex / (STEPPER_STEPS.length - 1)) * 100;

              return (
                <div key={step} className="flex flex-col items-center text-center relative z-10 space-y-2.5">
                  {isCompleted && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-blue-100 shadow">
                      ✓
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-blue-100 shadow animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-scale"></span>
                    </div>
                  )}
                  {isPending && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center border-4 border-white shadow-sm">
                      
                    </div>
                  )}
                  <span className={`text-xs font-bold ${isCurrent ? 'text-blue-600 font-extrabold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}

            {/* Blue line overlay */}
            <div 
              className="absolute top-1/2 left-10 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `calc(${currentStepIndex / (STEPPER_STEPS.length - 1) * 100}% - 40px)` }}
            ></div>
          </div>

          {/* Mobile vertical stepper */}
          <div className="md:hidden space-y-6 pl-4 relative">
            <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-gray-200 z-0"></div>
            
            {/* Dynamic blue progress line for mobile */}
            <div 
              className="absolute top-2 left-6 w-0.5 bg-blue-600 z-0 transition-all duration-500"
              style={{ height: `calc(${(currentStepIndex / (STEPPER_STEPS.length - 1)) * 100}% - 8px)` }}
            ></div>

            {STEPPER_STEPS.map((step, index) => {
              const label = STEP_LABELS[step];
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step} className="flex items-center gap-4 relative z-10">
                  {isCompleted && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center border-2 border-blue-100 shadow-sm flex-shrink-0">
                      ✓
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center border-2 border-blue-100 shadow-sm animate-pulse flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </div>
                  )}
                  {index > currentStepIndex && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                    </div>
                  )}
                  <span className={`text-xs font-bold ${isCurrent ? 'text-blue-600 font-extrabold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled/Returned Warning messages */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <ShieldAlert className="text-red-500" size={24} />
          <div>
            <h4 className="font-heading font-bold text-sm">Order Cancelled</h4>
            <p className="text-xs text-red-600/90 mt-0.5">This order was cancelled by the customer. A full refund has been credited back to your payment source.</p>
          </div>
        </div>
      )}
      {isReturned && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <AlertTriangle className="text-gray-500" size={24} />
          <div>
            <h4 className="font-heading font-bold text-sm">Order Returned</h4>
            <p className="text-xs text-gray-500/90 mt-0.5">This order has been returned. The return value has been successfully refunded back to your SwiftCart Wallet balance.</p>
          </div>
        </div>
      )}

      {/* 4. Order items catalog table */}
      <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="portal-heading font-bold text-base">Purchased items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-blue-50/20 text-gray-400 font-bold text-[10px] uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">Product details</th>
                <th className="px-6 py-3">Unit Price</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
              {currentOrder.items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/10">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                      <ProductImage
                        src={item.variant?.product?.images?.[0]}
                        alt={item.variant?.product?.name || 'Product'}
                        category={item.variant?.product?.category?.name || item.variant?.product?.brand || item.variant?.product?.name}
                        heightClass="h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-gray-800">{item.variant?.product?.name || 'Item'}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {item.variant.color && `${item.variant.color} • `}{item.variant.size && `${item.variant.size}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatPrice(item.unitPrice)}</td>
                  <td className="px-6 py-4 text-center">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{formatPrice(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Address used and Price breakdown layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Card info */}
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
          <h3 className="portal-heading font-bold text-base">Shipping address</h3>
          {currentOrder.address ? (
            <div className="space-y-2 text-xs font-semibold text-gray-600">
              <p className="font-heading font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-600" />
                <span>{currentOrder.address.label || 'Home Address'}</span>
              </p>
              <div className="pl-5 space-y-1">
                <p className="text-gray-800 font-bold">{currentOrder.address.line1}</p>
                {currentOrder.address.line2 && <p>{currentOrder.address.line2}</p>}
                <p>{currentOrder.address.city}, {currentOrder.address.state} - {currentOrder.address.zip}</p>
                <p>{currentOrder.address.country}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No address details stored for this order.</p>
          )}
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-2xl border border-blue-100/50 p-6 shadow-sm space-y-4">
          <h3 className="portal-heading font-bold text-base">Price breakdown</h3>
          <div className="space-y-2.5 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-gray-800">{formatPrice(currentOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className={currentOrder.deliveryFee === 0 ? 'text-emerald-600' : 'text-gray-800'}>
                {currentOrder.deliveryFee === 0 ? 'FREE' : formatPrice(currentOrder.deliveryFee)}
              </span>
            </div>
            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied</span>
                <span>-{formatPrice(currentOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes (5% GST)</span>
              <span className="text-gray-800">{formatPrice(currentOrder.tax)}</span>
            </div>
            <div className="border-t border-gray-150 pt-3 flex justify-between font-heading font-black text-base text-gray-900">
              <span>Total Paid</span>
              <span className="text-blue-600">{formatPrice(currentOrder.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Context Action Buttons footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-blue-100/50 shadow-sm">
        <button 
          onClick={handleHelp}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 font-bold rounded-xl text-xs transition-all bg-white"
        >
          <MessageCircle size={15} />
          <span>Need Help?</span>
        </button>

        <div className="flex gap-2">
          {currentOrder.status === 'PLACED' && (
            <button 
              onClick={handleCancel}
              className="px-5 py-2.5 border border-red-200 hover:border-red-600 text-red-650 hover:bg-red-50/20 font-bold rounded-xl text-xs transition-all bg-white"
            >
              Cancel Order
            </button>
          )}

          {currentOrder.status === 'DELIVERED' && (
            <>
              <button 
                onClick={handleRateReview}
                className="px-5 py-2.5 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl text-xs transition-all bg-white"
              >
                Rate & Review
              </button>
              <button 
                onClick={handleReturn}
                className="px-5 py-2.5 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl text-xs transition-all bg-white"
              >
                Return Items
              </button>
              <button 
                onClick={handleDownloadInvoice}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                <FileText size={14} />
                <span>Download Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
