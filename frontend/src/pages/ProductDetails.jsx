import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Loader2, ArrowLeft, Check, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';
import api from '../services/api';
import cartStore from '../store/cartStore';
import uiStore from '../store/uiStore';
import ProductImage from '../components/ProductImage';


export default function ProductDetails() {
  const { id } = useParams(); // actually holds the slug
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variant selection states
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { addToCart, loading: cartLoading } = cartStore();
  const { formatPrice } = uiStore();

  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const { data } = await api.get('/api/products');
        if (data.success) {
          // Get products from same category, excluding current product
          const items = data.products
            .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
            .slice(0, 3);
          
          // Fallback if not enough products in same category
          if (items.length < 3) {
            const extra = data.products
              .filter(p => p.id !== product.id && !items.find(i => i.id === p.id))
              .slice(0, 3 - items.length);
            setRelatedProducts([...items, ...extra]);
          } else {
            setRelatedProducts(items);
          }
        }
      } catch (err) {
        console.error('Failed to load related products:', err);
      }
    };
    fetchRelated();
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/${id}`);
        if (data.success) {
          setProduct(data.product);
          
          // Set initial variant selections if available
          const variants = data.product.variants || [];
          if (variants.length > 0) {
            // Find unique colors and sizes
            const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
            const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
            
            if (colors.length > 0) setSelectedColor(colors[0]);
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            
            // Default to first variant
            setSelectedVariant(variants[0]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product detail.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (!product || !product.variants) return;
    
    const variants = product.variants;
    // Find variant that matches both selectedColor and selectedSize
    const match = variants.find(v => {
      const colorMatch = !selectedColor || v.color === selectedColor;
      const sizeMatch = !selectedSize || v.size === selectedSize;
      return colorMatch && sizeMatch;
    });

    if (match) {
      setSelectedVariant(match);
    } else {
      // Fallback to first matching color or size
      const partialMatch = variants.find(v => v.color === selectedColor || v.size === selectedSize);
      if (partialMatch) setSelectedVariant(partialMatch);
    }
  }, [selectedColor, selectedSize, product]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addToCart(selectedVariant.id, quantity);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-semibold text-mid">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white rounded-card shadow-subtle border border-gray-100 p-8 text-center max-w-md mx-auto my-8">
        <AlertTriangle className="text-accent mx-auto mb-4" size={40} />
        <h3 className="font-heading font-bold text-lg text-dark">Error loading product</h3>
        <p className="text-sm text-mid mt-2">{error || 'Product not found.'}</p>
        <Link to="/" className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-btn text-sm font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const uniqueColors = product?.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : [];
  const uniqueSizes = product?.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [];
  const clothingSubcategories = ['clothing', 'topwear', 'bottomwear', 'footwear', 'accessories', 'kids-wear'];
  const groceryOrFoodSubcategories = ['groceries', 'fruits-vegetables', 'dairy-bread', 'cold-drinks-juices', 'munchies-chips', 'personal-care', 'food', 'indian', 'italian', 'chinese', 'mexican', 'american'];

  const isClothing = clothingSubcategories.includes(product.category?.slug) || product.category?.name?.toLowerCase()?.includes('cloth') || product.category?.name?.toLowerCase()?.includes('fashion');
  const isGroceryOrFood = groceryOrFoodSubcategories.includes(product.category?.slug) || product.category?.name?.toLowerCase()?.includes('grocer') || product.category?.name?.toLowerCase()?.includes('food');

  const quantityAvailable = selectedVariant?.inventory?.quantityAvailable ?? 0;
  const isOutOfStock = quantityAvailable <= 0;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-mid hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="bg-white p-6 rounded-card border border-gray-100 shadow-subtle flex flex-col justify-center">
          <div className="w-full h-[280px] rounded-card overflow-hidden">
            <ProductImage
              src={product.images?.[0]}
              alt={product.name}
              category={product.category?.name}
              heightClass="h-[280px]"
            />
          </div>
        </div>

        {/* Product Info / Checkout Panel */}
        <div className="space-y-6">
          <div>
            <span className="bg-primary-light text-primary-dark text-xs font-bold px-3 py-1 rounded-pill uppercase tracking-wider">
              {product.category?.name}
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-dark tracking-tight mt-3">
              {product.name}
            </h1>
            <p className="text-sm font-bold text-primary mt-1">{product.brand}</p>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                <Star className="fill-amber-400 stroke-none" size={16} />
                <span className="text-sm font-bold text-dark">{product.averageRating}</span>
              </div>
              <span className="text-sm text-mid">({product.totalReviews || 5} verified customer reviews)</span>
            </div>
          </div>

          <div className="border-t border-b border-gray-100 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-3xl text-dark">
                  {formatPrice(selectedVariant?.price || 0)}
                </span>
                {selectedVariant?.comparePrice && (
                  <span className="text-lg text-mid line-through">
                    {formatPrice(selectedVariant.comparePrice)}
                  </span>
                )}
              </div>
              {selectedVariant?.weight && (
                <span className="text-xs text-mid font-semibold block mt-1">
                  Net content: {selectedVariant.weight} {selectedVariant.unit}
                </span>
              )}
            </div>

            {/* Real-time Inventory badge */}
            <div>
              {isOutOfStock ? (
                <span className="bg-accent-light text-accent-dark border border-accent/20 text-xs font-bold px-3 py-1.5 rounded-btn flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle size={14} /> Out of Stock
                </span>
              ) : quantityAvailable < 10 ? (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-btn flex items-center gap-1.5">
                  ⚡ Hurry, only {quantityAvailable} left!
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-btn flex items-center gap-1.5">
                  <Check size={14} /> In Stock & Ready to Deliver
                </span>
              )}
            </div>
          </div>

          {/* Variants Selectors */}
          {uniqueColors.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-dark uppercase tracking-wider">Select Color</label>
              <div className="flex gap-2">
                {uniqueColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-xs font-bold border rounded-btn transition-all ${
                      selectedColor === color
                        ? 'bg-primary border-primary text-white shadow-subtle'
                        : 'bg-white border-gray-200 text-dark hover:border-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-dark uppercase tracking-wider">Select Size</label>
                {isClothing && (
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-primary hover:text-primary-dark font-extrabold hover:underline flex items-center gap-1 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    📐 Size Guide
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {uniqueSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-bold border rounded-btn transition-all ${
                      selectedSize === size
                        ? 'bg-primary border-primary text-white shadow-subtle'
                        : 'bg-white border-gray-200 text-dark hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div className="flex gap-4 items-center">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-200 rounded-btn bg-white overflow-hidden shadow-subtle">
              <button
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity(q => q - 1)}
                className="px-3 py-2 text-dark font-bold hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold text-dark">{quantity}</span>
              <button
                disabled={quantity >= quantityAvailable || isOutOfStock}
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-2 text-dark font-bold hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || cartLoading}
              className="flex-grow bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 px-6 rounded-btn shadow-subtle hover:shadow-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>

          {/* Superapp Assurances */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 text-xs font-semibold text-mid">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={18} />
              <span>100% Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="text-primary" size={18} />
              <span>Easy Returns & Refunds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enriched Product Information sections */}
      <div className="bg-white p-6 sm:p-8 rounded-card border border-gray-100 shadow-subtle space-y-8">
        {/* Description Section */}
        <div>
          <h3 className="font-heading font-extrabold text-xl text-dark border-b border-gray-100 pb-3">
            Product Description
          </h3>
          <p className="text-sm text-mid leading-relaxed mt-4">
            {product.description}
          </p>
        </div>

        {/* 1. Product Details Table and 2. Delivery Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
          {/* Details Table */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-dark">Technical Details</h3>
            <div className="overflow-hidden border border-gray-150 rounded-xl">
              <table className="min-w-full divide-y divide-gray-150 text-sm">
                <tbody className="divide-y divide-gray-150 bg-white">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-gray-500 bg-gray-50 w-1/3">SKU</td>
                    <td className="px-4 py-2.5 text-gray-800 font-mono">{product.sku || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-gray-500 bg-gray-50">Weight/Size</td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {selectedVariant?.weight ? `${selectedVariant.weight} ${selectedVariant.unit}` : selectedVariant?.size || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-gray-500 bg-gray-50">Brand</td>
                    <td className="px-4 py-2.5 text-gray-800 font-semibold">{product.brand || 'SwiftCart'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-gray-500 bg-gray-50">Material / Base</td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {isClothing ? '100% Premium Organic Cotton' : isGroceryOrFood ? 'Naturally Sourced Ingredients' : 'High-grade commercial components'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-gray-500 bg-gray-50">Origin</td>
                    <td className="px-4 py-2.5 text-gray-800">India</td>
                  </tr>
                  {isGroceryOrFood && (
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-gray-500 bg-gray-50">Shelf Life</td>
                      <td className="px-4 py-2.5 text-gray-800">
                        {product.category?.slug === 'food' ? 'Consume fresh (within 4 hours)' : '6 Months from packaging date'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Info Box */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-dark">Shipping & Returns</h3>
            <div className="bg-blue-50/20 border border-blue-100 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="font-bold text-sm text-dark">Estimated Delivery Time</h4>
                  <p className="text-xs text-mid mt-0.5">
                    {isGroceryOrFood ? 'Delivered to your doorstep in 10-15 minutes!' : 'Dispatched within 24 hours, delivered in 1-2 business days.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">🛵</span>
                <div>
                  <h4 className="font-bold text-sm text-dark">Delivery Courier Partner</h4>
                  <p className="text-xs text-mid mt-0.5">
                    {isGroceryOrFood ? 'SwiftCart Local Rider (Express Partner)' : 'SwiftCart Premium Logistics Courier'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">🔄</span>
                <div>
                  <h4 className="font-bold text-sm text-dark">Easy Return Policy</h4>
                  <p className="text-xs text-mid mt-0.5">
                    {isClothing ? 'Hassle-free 15-day return policy. Keep tags intact.' : 'Non-returnable. Full refund/replacement if item is defective, expired, or damaged on arrival.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Nutritional Information Accordion (Groceries/Food only) */}
        {isGroceryOrFood && (
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
            <button
              onClick={() => setNutritionOpen(!nutritionOpen)}
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-heading font-bold text-sm text-dark"
            >
              <span>📊 Nutritional Values (Per 100g serving)</span>
              <span className="text-lg transition-transform duration-200">{nutritionOpen ? '−' : '+'}</span>
            </button>
            
            {nutritionOpen && (
              <div className="p-4 bg-white divide-y divide-gray-150 text-xs">
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-500">Energy (Calories)</span>
                  <span className="text-dark font-bold">145 kcal (6% RDA)</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-500">Protein</span>
                  <span className="text-dark font-bold">4.8 g</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-500">Total Carbohydrates</span>
                  <span className="text-dark font-bold">22.4 g</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-500">Dietary Fiber</span>
                  <span className="text-dark font-bold">2.1 g</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-500">Total Fat</span>
                  <span className="text-dark font-bold">3.2 g</span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-500">Sodium</span>
                  <span className="text-dark font-bold">85 mg</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Frequently Bought Together */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-gray-100 space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-dark">🤝 Frequently Bought Together</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
              {/* Bundle items list */}
              <div className="lg:col-span-3 flex flex-wrap items-center gap-4">
                {/* Main Item */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl max-w-xs flex-1">
                  <ProductImage src={product.images?.[0]} alt={product.name} category={product.category?.name} heightClass="h-12 w-12" className="rounded-lg" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-dark truncate">{product.name}</p>
                    <p className="text-xs text-primary font-bold">{formatPrice(selectedVariant?.price || 0)}</p>
                  </div>
                </div>

                <span className="text-lg font-bold text-gray-400 select-none">+</span>

                {/* Related items */}
                {relatedProducts.map((p, idx) => {
                  const variant = p.variants?.[0];
                  return (
                    <React.Fragment key={p.id}>
                      <Link to={`/product/${p.slug}`} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 hover:border-blue-200 rounded-xl max-w-xs flex-1 transition-all">
                        <ProductImage src={p.images?.[0]} alt={p.name} category={p.category?.name || product.category?.name} heightClass="h-12 w-12" className="rounded-lg" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-dark truncate">{p.name}</p>
                          <p className="text-xs text-primary font-bold">{formatPrice(variant?.price || 0)}</p>
                        </div>
                      </Link>
                      {idx < relatedProducts.length - 1 && <span className="text-lg font-bold text-gray-400 select-none">+</span>}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Bundle buy call-to-action */}
              <div className="p-4 bg-blue-50/30 border border-dashed border-blue-200 rounded-xl flex flex-col justify-center space-y-2 text-center h-full">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bundle price</span>
                <p className="font-heading font-black text-xl text-dark">
                  {formatPrice(
                    (selectedVariant?.price || 0) + 
                    relatedProducts.reduce((sum, p) => sum + (p.variants?.[0]?.price || 0), 0)
                  )}
                </p>
                <button
                  onClick={async () => {
                    if (!selectedVariant) return;
                    await addToCart(selectedVariant.id, 1);
                    for (const p of relatedProducts) {
                      const v = p.variants?.[0];
                      if (v) await addToCart(v.id, 1);
                    }
                    uiStore.getState().addToast('Frequently bought together bundle added to cart!', 'success');
                  }}
                  className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-lg text-xs shadow-sm transition-all"
                >
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Customer Reviews Section with ratings breakdown */}
        <div className="pt-8 border-t border-gray-100 space-y-6">
          <h3 className="font-heading font-extrabold text-lg text-dark">
            ⭐ Customer Reviews
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            {/* Average rating stat card */}
            <div className="text-center space-y-1 md:border-r border-gray-200 py-2">
              <h4 className="font-heading font-black text-5xl text-dark">{product.averageRating}</h4>
              <div className="flex justify-center text-amber-400 py-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(product.averageRating) ? 'fill-amber-400 stroke-none' : 'text-gray-200'}
                    size={20}
                  />
                ))}
              </div>
              <p className="text-xs text-mid font-semibold">Based on {product.reviews?.length || 5} reviews</p>
            </div>

            {/* Progress Bars Chart */}
            <div className="md:col-span-2 space-y-2.5">
              {[
                { label: '5 Star', percent: '70%' },
                { label: '4 Star', percent: '18%' },
                { label: '3 Star', percent: '6%' },
                { label: '2 Star', percent: '4%' },
                { label: '1 Star', percent: '2%' }
              ].map((row, idx) => (
                <div key={idx} className="flex items-center text-xs font-bold text-gray-500 gap-3">
                  <span className="w-12 text-left whitespace-nowrap">{row.label}</span>
                  <div className="flex-grow bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: row.percent }}></div>
                  </div>
                  <span className="w-8 text-right font-mono">{row.percent}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Review Cards */}
          <div className="space-y-4 divide-y divide-gray-100">
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-sm text-mid italic py-4">No reviews written for this product yet. Be the first to review!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
                        alt={rev.user?.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-100 bg-gray-50"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-dark">{rev.user?.name || 'Verified Customer'}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={i < rev.rating ? 'fill-amber-400 stroke-none' : 'text-gray-200'}
                                size={11}
                              />
                            ))}
                          </div>
                          {rev.isVerifiedPurchase !== false && (
                            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.25 rounded-md border border-emerald-100 font-extrabold uppercase tracking-wider">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-mid font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h5 className="text-sm font-bold text-dark pt-1">{rev.title}</h5>
                  <p className="text-xs text-mid leading-relaxed">{rev.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Size Guide Modal (Clothing only) */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop shade */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSizeGuide(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-150 max-w-md w-full p-6 relative z-10 animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-dark">📐 Clothing Size Guide</h3>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-400 hover:text-dark text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-mid">Measurements are shown in inches. Choose your regular size for best fit.</p>

            <div className="overflow-hidden border border-gray-150 rounded-xl">
              <table className="min-w-full divide-y divide-gray-150 text-xs">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Chest</th>
                    <th className="px-4 py-2 text-left">Waist</th>
                    <th className="px-4 py-2 text-left">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  <tr>
                    <td className="px-4 py-2 font-bold text-dark">S</td>
                    <td className="px-4 py-2 text-gray-600">36" - 38"</td>
                    <td className="px-4 py-2 text-gray-600">30" - 32"</td>
                    <td className="px-4 py-2 text-gray-600">28.5"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-dark">M</td>
                    <td className="px-4 py-2 text-gray-600">38" - 40"</td>
                    <td className="px-4 py-2 text-gray-600">32" - 34"</td>
                    <td className="px-4 py-2 text-gray-600">29.0"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-dark">L</td>
                    <td className="px-4 py-2 text-gray-600">40" - 42"</td>
                    <td className="px-4 py-2 text-gray-600">34" - 36"</td>
                    <td className="px-4 py-2 text-gray-600">30.0"</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-dark">XL</td>
                    <td className="px-4 py-2 text-gray-600">42" - 44"</td>
                    <td className="px-4 py-2 text-gray-600">36" - 38"</td>
                    <td className="px-4 py-2 text-gray-600">31.0"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-lg text-xs transition-all shadow"
              >
                Close Size Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
