import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Star, Loader2, ArrowLeft, RotateCcw } from 'lucide-react';
import api from '../services/api';
import uiStore from '../store/uiStore';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = uiStore();

  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [loading, setLoading] = useState(true);
  const [baseProducts, setBaseProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  // Sidebar Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(5000);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');

  // Fetch categories and trending products on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const catRes = await api.get('/api/categories');
        if (catRes.data?.success) {
          setCategories(catRes.data.categories);
        }
        const trendRes = await api.get('/api/products', { params: { limit: 5 } });
        if (trendRes.data?.success) {
          setTrendingProducts(trendRes.data.products);
        }
      } catch (err) {
        console.error('Failed to fetch filter metadata', err);
      }
    };
    fetchMeta();
  }, []);

  // Sync state with URL parameter changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Fetch base products matching the query/category from API
  useEffect(() => {
    const fetchBaseProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (q) params.q = q;
        if (categoryParam) params.category = categoryParam;

        const { data } = await api.get('/api/products', { params });
        if (data?.success) {
          setBaseProducts(data.products);
          
          // Compute dynamic max price from results
          const prices = data.products.map(p => p.variants?.[0]?.price).filter(Boolean);
          const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 5000;
          setMaxPriceLimit(maxPrice);
          setPriceRange([0, maxPrice]);
          
          // Reset filters when the query changes
          setRatingFilter(null);
          setSelectedBrands([]);
          setInStockOnly(false);
        }
      } catch (err) {
        console.error('Failed to fetch search results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseProducts();
  }, [q, categoryParam]);

  // Extract unique brands dynamically from search results
  const availableBrands = [...new Set(baseProducts.map(p => p.brand).filter(Boolean))];

  // Apply filters and sorting locally
  useEffect(() => {
    let result = [...baseProducts];

    // 1. Category filter
    if (selectedCategory) {
      result = result.filter(p => 
        p.category?.slug === selectedCategory || 
        p.category?.parent?.slug === selectedCategory
      );
    }

    // 2. Price filter
    result = result.filter(p => {
      const price = p.variants?.[0]?.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // 3. Rating filter
    if (ratingFilter !== null) {
      result = result.filter(p => p.averageRating >= ratingFilter);
    }

    // 4. Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // 5. In-Stock filter
    if (inStockOnly) {
      result = result.filter(p => 
        p.variants?.some(v => (v.inventory?.quantityAvailable ?? 0) > 0)
      );
    }

    // 6. Sorting
    if (sortOption === 'price_asc') {
      result.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'rating_desc') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setFilteredProducts(result);
  }, [baseProducts, selectedCategory, priceRange, ratingFilter, selectedBrands, inStockOnly, sortOption]);

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    // Sync to URL if they filter by category
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSelectedCategory(categoryParam);
    setPriceRange([0, maxPriceLimit]);
    setRatingFilter(null);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSortOption('relevance');
  };

  return (
    <div className="space-y-6">
      {/* Search Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider mb-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-dark tracking-tight leading-none">
            {q ? `Search Results for "${q}"` : 'Browse Catalog'}
          </h1>
          <p className="text-xs font-semibold text-gray-400">
            {loading ? 'Searching catalog...' : `${filteredProducts.length} matching products found`}
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-250 rounded-btn text-xs font-bold px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary shadow-subtle cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrival</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-semibold text-mid">Finding the best matches...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 1. FILTER SIDEBAR */}
          <div className="lg:col-span-1 bg-white p-6 rounded-card border border-gray-100 shadow-subtle space-y-6 h-fit">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="font-heading font-extrabold text-dark text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </span>
              <button 
                type="button" 
                onClick={clearAllFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-dark uppercase tracking-wider">Category</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left text-xs font-semibold px-2 py-1 rounded transition-colors ${
                    !selectedCategory ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left text-xs font-semibold px-2 py-1 rounded transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{cat.iconUrl} {cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-dark uppercase tracking-wider">Price Range</h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between items-center gap-2">
                  <div className="w-1/2 p-2 border border-gray-200 rounded text-center">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Min</span>
                    <span className="text-xs font-bold text-dark">{formatPrice(priceRange[0])}</span>
                  </div>
                  <div className="w-1/2 p-2 border border-gray-200 rounded text-center">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Max</span>
                    <span className="text-xs font-bold text-dark">{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-dark uppercase tracking-wider">Average Rating</h4>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                    className={`w-full flex items-center justify-between px-2 py-1 text-xs font-semibold rounded transition-colors ${
                      ratingFilter === stars ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < stars ? "fill-amber-500 stroke-none" : "stroke-gray-300 fill-none"} 
                          />
                        ))}
                      </span>
                      <span>& Up</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-dark uppercase tracking-wider">Brands</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {availableBrands.map((brand) => (
                    <label 
                      key={brand} 
                      className="flex items-center gap-2 px-2 py-0.5 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="truncate">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability / In-stock Toggle */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center justify-between px-2 py-1 text-xs font-bold text-dark uppercase tracking-wider cursor-pointer">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 2. RESULTS GRID */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              /* NO RESULTS STATE */
              <div className="bg-white rounded-card shadow-subtle border border-gray-100 p-10 text-center max-w-xl mx-auto space-y-8 animate-in fade-in duration-300">
                <div>
                  <p className="text-5xl mb-3">🔍</p>
                  <h3 className="font-heading font-extrabold text-xl text-dark">No matches found</h3>
                  <p className="text-sm text-mid mt-2 max-w-md mx-auto">
                    We couldn't find any products matching your filters or search term "{q}". Try resetting filters or browsing other categories.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-btn shadow-subtle transition-all"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>

                {/* Suggested Categories */}
                {categories.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-gray-100 text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.filter(c => !c.parentId).slice(0, 6).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-pill text-xs font-bold text-dark transition-all"
                        >
                          <span>{cat.iconUrl}</span>
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Trending Products */}
                {trendingProducts.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-gray-100 text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trending Products</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trendingProducts.slice(0, 4).map((prod) => {
                        const price = prod.variants?.[0]?.price || 0;
                        return (
                          <Link
                            key={prod.id}
                            to={`/product/${prod.slug}`}
                            className="flex items-center gap-3 p-2 border border-gray-100 hover:border-blue-500 rounded-btn transition-colors hover:bg-gray-50/30"
                          >
                            <img
                              src={prod.images?.[0]}
                              className="w-12 h-12 rounded object-cover flex-shrink-0 border border-gray-100"
                              alt=""
                            />
                            <div className="min-w-0 flex-grow">
                              <p className="text-xs font-bold text-dark truncate">{prod.name}</p>
                              <span className="text-[10px] text-gray-400 uppercase font-bold">{prod.brand}</span>
                            </div>
                            <span className="text-xs font-extrabold text-dark pr-2">{formatPrice(price)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* PRODUCTS GRID */
              <div className="flex flex-wrap gap-4 justify-start">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    searchQuery={q} 
                  />
                ))}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
