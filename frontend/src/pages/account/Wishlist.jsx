import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, Loader2, ArrowRight, Star } from 'lucide-react';
import accountStore from '../../store/accountStore';
import cartStore from '../../store/cartStore';
import uiStore from '../../store/uiStore';
import ProductImage from '../../components/ProductImage';


export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, fetchWishlist, toggleWishlist, loading } = accountStore();
  const { addToCart } = cartStore();
  const { formatPrice } = uiStore();

  const [sortBy, setSortBy] = useState('DATE_ADDED');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  const handleAddToCart = async (e, variantId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId) return;
    await addToCart(variantId, 1);
  };

  const handleBuyNow = async (e, variantId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId) return;
    const ok = await addToCart(variantId, 1);
    if (ok) {
      navigate('/checkout');
    }
  };

  const handleShareWishlist = () => {
    const shareUrl = `${window.location.origin}/wishlist/shared?user=${summary?.name || 'customer'}`;
    navigator.clipboard.writeText(shareUrl);
    uiStore.getState().addToast('Wishlist link copied to clipboard! Share it with friends.', 'success');
  };

  const handleNotifyMe = (e, productName) => {
    e.preventDefault();
    e.stopPropagation();
    uiStore.getState().addToast(`Notification set for "${productName}". We'll let you know when it's back!`, 'success');
  };

  const getSortedWishlist = () => {
    if (!wishlist) return [];
    
    return [...wishlist].sort((a, b) => {
      const variantA = a.product?.variants?.[0];
      const variantB = b.product?.variants?.[0];
      const priceA = variantA?.price || 0;
      const priceB = variantB?.price || 0;
      
      if (sortBy === 'PRICE_LOW') {
        return priceA - priceB;
      }
      if (sortBy === 'PRICE_HIGH') {
        return priceB - priceA;
      }
      if (sortBy === 'RATING') {
        return (b.product?.averageRating || 5) - (a.product?.averageRating || 5);
      }
      // default DATE_ADDED
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const sortedWishlist = getSortedWishlist();

  return (
    <div className="space-y-6 portal-body">
      {/* 1. Header Control Bar */}
      <div className="bg-white rounded-2xl border border-blue-100/50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="portal-heading text-lg font-bold">My Wishlist</h2>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {wishlist?.length || 0} Items
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Share Wishlist */}
          {wishlist?.length > 0 && (
            <button
              onClick={handleShareWishlist}
              className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl text-xs transition-all bg-white"
            >
              <Share2 size={14} />
              <span>Share Wishlist</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
          >
            <option value="DATE_ADDED">Sort: Date Added</option>
            <option value="PRICE_LOW">Sort: Price (Low to High)</option>
            <option value="PRICE_HIGH">Sort: Price (High to Low)</option>
            <option value="RATING">Sort: Top Rated</option>
          </select>
        </div>
      </div>

      {/* 2. Grid Catalog of Product Cards */}
      {loading.wishlist ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-blue-100/50 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-sm font-semibold text-gray-400 mt-2">Loading wishlist...</p>
        </div>
      ) : sortedWishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100/50 p-12 text-center shadow-sm max-w-md mx-auto">
          {/* Heart SVG illustration */}
          <svg className="w-20 h-20 mx-auto text-blue-100 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <h4 className="portal-heading text-lg font-bold mt-4">Save items you love</h4>
          <p className="text-xs text-gray-400 font-semibold mt-1 max-w-xs mx-auto">
            You don't have any items in your wishlist yet. Explore products and save them for checkout!
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <span>Explore Shop</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedWishlist.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            const mainVariant = prod.variants?.[0];
            const price = mainVariant?.price || 0;
            const comparePrice = mainVariant?.comparePrice;

            // Mock check stock availability. In prototype, we can use inventory check or assume some logic
            const isOutOfStock = prod.sku?.includes('C-10015') || false; // Mock specific item as out of stock

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-blue-50/50 overflow-hidden flex flex-col group hover:shadow-md hover:border-blue-150 transition-all duration-200 relative"
              >
                {/* Heart Toggle Button */}
                <button
                  onClick={(e) => handleRemove(e, prod.id)}
                  className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-red-500 rounded-full shadow transition-all hover:scale-110"
                  title="Remove from wishlist"
                >
                  <Heart className="fill-current stroke-current" size={16} />
                </button>

                {/* Image Wrapper */}
                <div className="relative w-full h-[200px] overflow-hidden">
                  <ProductImage
                    src={prod.images?.[0]}
                    alt={prod.name}
                    category={prod.brand}
                    heightClass="h-[200px]"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
                    {prod.brand}
                  </span>

                  {/* Out of Stock Grey Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center z-10">
                      <span className="bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                        Out of stock
                      </span>
                      <button
                        onClick={(e) => handleNotifyMe(e, prod.name)}
                        className="mt-3 px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-lg text-[10px] shadow transition-all hover:scale-105 active:scale-95"
                      >
                        Notify Me
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <Link to={`/product/${prod.slug}`}>
                      <h3 className="font-heading font-bold text-xs text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                        {prod.name}
                      </h3>
                    </Link>
                    
                    {/* Rating info */}
                    <div className="flex items-center gap-1">
                      <Star className="fill-amber-400 stroke-none" size={13} />
                      <span className="text-[10px] font-bold text-gray-700">{prod.averageRating || '4.5'}</span>
                    </div>
                  </div>

                  {/* Price & info row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading font-black text-sm text-gray-800">
                          {formatPrice(price)}
                        </span>
                        {comparePrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(comparePrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        {isOutOfStock ? 'TEMPORARILY OUT' : 'IN STOCK'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons row: Buy Now (rounded-l) and Cart Icon (rounded-r) */}
                  {!isOutOfStock && mainVariant && (
                    <div className="flex flex-col sm:flex-row mt-3 pt-3 border-t border-gray-100 gap-2 sm:gap-0 w-full">
                      <button
                        onClick={(e) => handleBuyNow(e, mainVariant.id)}
                        className="w-full sm:w-[70%] bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold py-2.5 px-3 rounded-t-xl sm:rounded-l-full sm:rounded-tr-none sm:rounded-br-none text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(e, mainVariant.id)}
                        className="w-full sm:w-[30%] bg-[#0A1628] hover:bg-slate-800 text-white py-2.5 px-3 rounded-b-xl sm:rounded-r-full sm:rounded-tl-none sm:rounded-bl-none flex items-center justify-center transition-all"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
