import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, Tag, AlertTriangle, ArrowRight } from 'lucide-react';
import cartStore from '../store/cartStore';
import authStore from '../store/authStore';
import uiStore from '../store/uiStore';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { user } = authStore();
  const {
    cart,
    loading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    activeCoupon,
    removeCoupon,
    getCartSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getTaxAmount,
    getCartTotal
  } = cartStore();

  const { formatPrice } = uiStore();
  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleQtyChange = async (itemId, currentQty, increment) => {
    const nextQty = increment ? currentQty + 1 : currentQty - 1;
    if (nextQty <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, nextQty);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const ok = await applyCouponCode(couponInput);
    if (ok) setCouponInput('');
  };

  if (!user) {
    return (
      <div className="bg-white rounded-card shadow-subtle border border-gray-100 p-12 text-center max-w-md mx-auto my-8 space-y-4">
        <p className="text-4xl">🔑</p>
        <h3 className="font-heading font-bold text-lg text-dark">Login Required</h3>
        <p className="text-sm text-mid">Please sign in to view your shopping cart items.</p>
        <Link to="/login" className="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-btn text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-subtle border border-gray-100 p-12 text-center max-w-md mx-auto my-8 space-y-4">
        <ShoppingBag className="text-primary mx-auto" size={48} />
        <h3 className="font-heading font-bold text-lg text-dark">Your cart is empty</h3>
        <p className="text-sm text-mid">Browse our fresh grocery catalog and premium fashion to add items.</p>
        <Link to="/" className="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-btn text-sm">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-heading font-extrabold text-2xl text-dark mb-6">Shopping Cart ({items.length} items)</h2>
        
        {items.map((item) => {
          const v = item.variant;
          const p = v.product;
          
          return (
            <div
              key={item.id}
              className="bg-white p-4 rounded-card border border-gray-100 shadow-subtle flex gap-4 items-center group"
            >
              {/* Product Image */}
              <div className="w-20 h-20 rounded-btn overflow-hidden border border-gray-50 flex-shrink-0">
                <ProductImage
                  src={p.images?.[0]}
                  alt={p.name}
                  category={p.category?.name || p.brand || p.name}
                  heightClass="h-full"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0">
                <Link to={`/product/${p.slug}`} className="font-heading font-extrabold text-sm text-dark hover:text-primary transition-colors block line-clamp-1">
                  {p.name}
                </Link>
                <p className="text-xs text-primary font-bold">{p.brand}</p>
                
                {/* Variant Swatches info */}
                {(v.color || v.size) && (
                  <div className="flex gap-2 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-mid">
                    {v.color && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{v.color}</span>}
                    {v.size && <span className="bg-gray-100 px-1.5 py-0.5 rounded">Size {v.size}</span>}
                  </div>
                )}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-200 rounded-btn bg-gray-50 overflow-hidden">
                <button
                  onClick={() => handleQtyChange(item.id, item.quantity, false)}
                  className="px-2.5 py-1.5 text-dark font-bold hover:bg-gray-100 active:bg-gray-200"
                >
                  <Minus size={12} />
                </button>
                <span className="px-3 text-xs font-bold text-dark">{item.quantity}</span>
                <button
                  onClick={() => handleQtyChange(item.id, item.quantity, true)}
                  className="px-2.5 py-1.5 text-dark font-bold hover:bg-gray-100 active:bg-gray-200"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Price & Delete */}
              <div className="text-right flex-shrink-0 min-w-[80px]">
                <p className="font-heading font-extrabold text-sm text-dark">
                  {formatPrice(v.price * item.quantity)}
                </p>
                <p className="text-[10px] text-mid font-semibold">
                  {formatPrice(v.price)} each
                </p>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors mt-2"
                  title="Remove item"
                >
                  <Trash2 size={16} className="ml-auto" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Details Summary */}
      <div className="space-y-6">
        <h2 className="font-heading font-extrabold text-xl text-dark">Order Summary</h2>

        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-6">
          {/* Coupon Code Panel */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-dark uppercase tracking-wider">Promotional Discount</h3>
            {activeCoupon ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-btn flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag size={14} />
                  <span>Code: {activeCoupon.code} applied!</span>
                </div>
                <button onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-900 underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="WELCOME10 / FLAT50"
                  className="flex-grow px-3 py-2 bg-gray-50 border border-gray-200 rounded-btn text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="bg-dark hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-btn text-xs"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Pricing Details List */}
          <div className="space-y-3 text-sm border-t border-gray-50 pt-4">
            <div className="flex justify-between text-mid font-medium">
              <span>Item Subtotal</span>
              <span className="text-dark font-semibold">{formatPrice(getCartSubtotal())}</span>
            </div>
            
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Promo Discount</span>
                <span>-{formatPrice(getDiscountAmount())}</span>
              </div>
            )}

            <div className="flex justify-between text-mid font-medium">
              <span>Delivery Fee</span>
              <span className="text-dark font-semibold">
                {getDeliveryFee() === 0 ? 'FREE' : formatPrice(getDeliveryFee())}
              </span>
            </div>

            <div className="flex justify-between text-mid font-medium">
              <span>Taxes (5% GST)</span>
              <span className="text-dark font-semibold">{formatPrice(getTaxAmount())}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between text-base font-extrabold text-dark pt-3 border-t border-gray-100">
              <span>Grand Total</span>
              <span className="text-lg text-primary">{formatPrice(getCartTotal())}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 rounded-btn shadow-subtle hover:shadow-hover transition-all flex items-center justify-center gap-2 text-sm"
          >
            Proceed to Checkout
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
