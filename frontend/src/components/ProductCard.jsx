import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import ProductImage from './ProductImage';
import cartStore from '../store/cartStore';
import uiStore from '../store/uiStore';

export default function ProductCard({ product, searchQuery = '' }) {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = cartStore();
  const { formatPrice } = uiStore();

  const mainVariant = product.variants?.[0];
  const price = mainVariant?.price || 0;
  const comparePrice = mainVariant?.comparePrice;
  const quantityAvailable = mainVariant?.inventory?.quantityAvailable ?? 0;
  const hasMultipleVariants = product.variants?.length > 1;

  // Highlight helper
  const highlightQuery = (text, queryText) => {
    if (!queryText || !queryText.trim()) return text;
    const trimmed = queryText.trim();
    const parts = text.split(new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === trimmed.toLowerCase() 
            ? <strong key={i} className="font-extrabold text-primary-dark">{part}</strong>
            : part
        )}
      </span>
    );
  };

  // Calculate discount percentage
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const foodSubcategories = ['food', 'indian', 'italian', 'chinese', 'mexican', 'american'];
  const clothingSubcategories = ['clothing', 'topwear', 'bottomwear', 'footwear', 'accessories', 'kids-wear'];

  const isFood = foodSubcategories.includes(product.category?.slug) || product.category?.name?.toLowerCase()?.includes('food');
  const isClothing = clothingSubcategories.includes(product.category?.slug) || product.category?.name?.toLowerCase()?.includes('cloth') || product.category?.name?.toLowerCase()?.includes('fashion');

  // Food specific checks: veg vs non-veg
  const isNonVeg = isFood && (
    product.name?.toLowerCase()?.includes('chicken') || 
    product.name?.toLowerCase()?.includes('meat') || 
    product.name?.toLowerCase()?.includes('mutton') || 
    product.name?.toLowerCase()?.includes('fish') || 
    product.name?.toLowerCase()?.includes('egg') ||
    (Array.isArray(product.tags) 
      ? product.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('non-veg'))
      : (typeof product.tags === 'string' && product.tags.toLowerCase().includes('non-veg'))
    )
  );

  // Clothing specific swatches
  const colors = isClothing && product.variants 
    ? [...new Set(product.variants.map(v => v.color).filter(Boolean))].slice(0, 3) 
    : [];
  // Fallback swatches if clothing has variants but no color names
  const swatches = isClothing && colors.length === 0 && hasMultipleVariants 
    ? ['#1E293B', '#3B82F6', '#EF4444'] 
    : colors;

  // Find item in cart
  const cartItem = mainVariant ? cart?.items?.find(item => item.variantId === mainVariant.id) : null;

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mainVariant) return;
    await addToCart(mainVariant.id, 1);
  };

  const handleBuyNowClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mainVariant) return;
    const ok = await addToCart(mainVariant.id, 1);
    if (ok) {
      navigate('/checkout');
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="w-[148px] sm:w-[180px] bg-white rounded-[14px] border border-gray-100 shadow-[0_4px_12px_rgba(10,158,92,0.06)] flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(10,158,92,0.12)] transition-all duration-300 overflow-hidden group flex-shrink-0"
    >
      {/* Image Container */}
      <div className="relative w-full h-[200px] overflow-hidden">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          category={product.category?.name}
          heightClass="h-[200px]"
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top-Left Discount/Sale Badge */}
        {discount > 0 ? (
          <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-full z-10 shadow-sm">
            {discount}% OFF
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-primary text-white font-bold text-[11px] px-2 py-0.5 rounded-full z-10 shadow-sm">
            ⚡ SALE
          </span>
        )}

        {/* Top-Right Low Stock Badge */}
        {quantityAvailable > 0 && quantityAvailable < 10 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-full z-10 shadow-sm">
            Only {quantityAvailable} left
          </span>
        )}

        {/* Food Delivery time badge */}
        {isFood && (
          <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
            ⏱️ 15 mins
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand Name */}
          <span className="text-[10px] uppercase font-bold text-primary tracking-wider block truncate">
            {product.brand || 'SwiftCart'}
          </span>

          {/* Product Title */}
          <h3 className="text-[13px] text-[#0A1628] font-bold line-clamp-2 leading-tight mt-1 h-8 group-hover:text-primary transition-colors">
            {highlightQuery(product.name, searchQuery)}
          </h3>

          {/* Star rating row and Veg/Non-Veg dot */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-bold">
              <Star className="fill-amber-500 stroke-none" size={10} />
              <span className="text-dark ml-0.5">{product.averageRating || '4.5'}</span>
            </div>

            {isFood && (
              <div className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 ${isNonVeg ? 'border-red-500' : 'border-emerald-500'} p-0.5`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isNonVeg ? 'bg-red-500' : 'bg-emerald-500'}`} />
              </div>
            )}
          </div>

          {/* Swatches (Fashion only) */}
          {isClothing && swatches.length > 0 && (
            <div className="flex gap-1 mt-2 h-4 items-center">
              {swatches.map((colorName, idx) => {
                const colorMap = {
                  'Black': '#000000',
                  'White': '#FFFFFF',
                  'Red': '#EF4444',
                  'Blue': '#3B82F6',
                  'Green': '#10B981',
                  'Yellow': '#F59E0B',
                  'Grey': '#9CA3AF',
                  'Beige': '#F5F5DC',
                  'Pink': '#EC4899',
                  'Orange': '#FF6B35'
                };
                const hex = typeof colorName === 'string' && colorName.startsWith('#') 
                  ? colorName 
                  : colorMap[colorName] || '#9CA3AF';
                return (
                  <span 
                    key={idx} 
                    className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: hex }}
                    title={typeof colorName === 'string' ? colorName : ''}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Price & Button area */}
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-[#0A1628]">{formatPrice(price)}</span>
            {comparePrice && (
              <span className="text-[10px] text-gray-400 line-through">{formatPrice(comparePrice)}</span>
            )}
          </div>

          {/* Stepper / Action Button */}
          {isClothing ? (
            <button
              onClick={handleBuyNowClick}
              className="w-full mt-3 bg-primary hover:bg-primary-dark text-white font-bold py-1.5 px-3 rounded-md text-xs transition-all flex items-center justify-center select-none"
            >
              Buy Now
            </button>
          ) : cartItem ? (
            <div className="flex items-center justify-between mt-3 bg-primary text-white rounded-md overflow-hidden text-xs w-full transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (cartItem.quantity > 1) {
                    updateQuantity(cartItem.id, cartItem.quantity - 1);
                  } else {
                    removeFromCart(cartItem.id);
                  }
                }}
                className="px-3 py-1.5 bg-primary-dark hover:bg-primary-dark/90 font-bold text-center w-8 select-none"
              >
                −
              </button>
              <span className="font-bold select-none">{cartItem.quantity}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(cartItem.id, cartItem.quantity + 1);
                }}
                className="px-3 py-1.5 bg-primary-dark hover:bg-primary-dark/90 font-bold text-center w-8 select-none"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCartClick}
              className="w-full mt-3 bg-primary hover:bg-primary-dark text-white font-bold py-1.5 px-3 rounded-md text-xs transition-all flex items-center justify-center select-none"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
