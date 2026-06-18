import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../services/api';
import cartStore from '../store/cartStore';
import uiStore from '../store/uiStore';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const STATIC_BANNERS = [
  {
    title: 'Fresh Groceries in 10 Mins!',
    desc: 'Get crisp fruits, fresh vegetables, and daily essentials delivered instantly.',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=400&q=80',
    link: 'groceries',
    gradient: 'from-emerald-900/80 via-emerald-800/40 to-transparent'
  },
  {
    title: 'Hot Restaurant Favorites',
    desc: 'Order delicious burgers, biryanis, and pizzas cooked fresh by top chefs.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&h=400&q=80',
    link: 'food',
    gradient: 'from-orange-950/80 via-orange-900/40 to-transparent'
  },
  {
    title: 'Trendy Fashion & Streetwear',
    desc: 'Upgrade your wardrobe with oversized shirts, denim, and sneakers.',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
    link: 'clothing',
    gradient: 'from-blue-950/80 via-blue-900/40 to-transparent'
  }
];

// ==========================================
// Horizontally Scrollable Flex Row Component
// ==========================================
function ProductScrollRow({ title, emoji, slug, items, handleCategorySelect }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const offset = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1 bg-primary h-6 rounded-full" />
          <h2 className="text-lg sm:text-xl font-heading font-extrabold text-dark tracking-tight">
            {emoji} {title}
          </h2>
        </div>
        <button
          onClick={() => handleCategorySelect(slug)}
          className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1.5"
        >
          See All →
        </button>
      </div>

      {/* Row Wrapper with arrows appearing on hover */}
      <div className="relative group/row">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-gray-150 items-center justify-center text-slate-800 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 hover:bg-white"
        >
          ←
        </button>

        {/* Scroll Row */}
        <div 
          ref={rowRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full py-1 pb-4"
          style={{ webkitOverflowScrolling: 'touch' }}
        >
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-gray-150 items-center justify-center text-slate-800 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 hover:bg-white"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ==========================================
// Main Home Page Component
// ==========================================
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const getPathCategory = () => {
    const p = location.pathname.split('/').filter(Boolean)[0];
    if (p === 'groceries') return 'groceries';
    if (p === 'food') return 'food';
    if (p === 'clothes' || p === 'clothing') return 'clothing';
    return '';
  };
  const pathCategory = getPathCategory();
  const activeCategory = searchParams.get('category') || pathCategory;
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/api/categories');
        if (data.success) {
          // Keep only main categories
          setCategories(data.categories.filter(c => !c.parentId));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory) params.category = activeCategory;

        const { data } = await api.get('/api/products', { params });
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  // Rotate banner every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % STATIC_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCategorySelect = (slug) => {
    if (activeCategory === slug) {
      navigate('/');
    } else {
      const pathMap = {
        groceries: 'groceries',
        food: 'food',
        clothing: 'clothing'
      };
      navigate(`/${pathMap[slug] || slug}`);
    }
  };

  // Filter products by category for horizontal scroll rows
  const groceriesSubcategories = ['groceries', 'fruits-vegetables', 'dairy-bread', 'cold-drinks-juices', 'munchies-chips', 'personal-care'];
  const foodSubcategoriesList = ['food', 'indian', 'italian', 'chinese', 'mexican', 'american'];
  const clothingSubcategoriesList = ['clothing', 'topwear', 'bottomwear', 'footwear', 'accessories', 'kids-wear'];

  const groceriesProducts = products.filter(p => groceriesSubcategories.includes(p.category?.slug) || p.category?.name?.toLowerCase()?.includes('grocer'));
  const foodProducts = products.filter(p => foodSubcategoriesList.includes(p.category?.slug) || p.category?.name?.toLowerCase()?.includes('food'));
  const fashionProducts = products.filter(p => clothingSubcategoriesList.includes(p.category?.slug) || p.category?.name?.toLowerCase()?.includes('cloth') || p.category?.name?.toLowerCase()?.includes('fashion'));

  return (
    <div className="space-y-10">
      {/* Banner Carousel */}
      <div className="relative h-[280px] sm:h-[360px] rounded-card overflow-hidden shadow-subtle group">
        {STATIC_BANNERS.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.img}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} z-20 flex flex-col justify-center px-8 sm:px-16 max-w-lg space-y-4`}>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                {banner.title}
              </h1>
              <p className="text-sm sm:text-lg text-gray-200 font-medium">
                {banner.desc}
              </p>
              <div>
                <button
                  onClick={() => handleCategorySelect(banner.link)}
                  className="bg-white hover:bg-gray-100 text-dark font-extrabold px-6 py-3 rounded-btn shadow-subtle transition-all transform hover:scale-105 active:scale-95 text-sm"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {STATIC_BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveBanner(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === activeBanner ? 'bg-white w-6' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search & Filtering Control Center */}
      <div className="bg-white rounded-card shadow-subtle border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <SearchBar className="w-full md:max-w-md" />

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-pill text-sm font-bold border transition-all ${
                activeCategory === cat.slug
                  ? 'bg-primary border-primary text-white shadow-subtle scale-105'
                  : 'bg-white border-gray-200 text-dark hover:border-primary hover:text-primary'
              }`}
            >
              <span>{cat.iconUrl}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Render (Category grid vs Homepage rows) */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-semibold text-mid">Loading products catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-card shadow-subtle border border-gray-100 p-12 text-center max-w-md mx-auto">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="font-heading font-bold text-lg text-dark">No products found</h3>
            <p className="text-sm text-mid mt-2">Try adjusting your keywords or clearing the category filters.</p>
          </div>
        ) : activeCategory ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-1 bg-primary h-6 rounded-full" />
                <h2 className="text-lg sm:text-xl font-heading font-extrabold text-dark tracking-tight">
                  {activeCategory === 'groceries' ? '🍎 Fresh Groceries' : 
                   activeCategory === 'food' ? '🍔 Hot Restaurant Favorites' : 
                   activeCategory === 'clothing' ? '👕 Trendy Fashion & Streetwear' : 
                   `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Products`}
                </h2>
              </div>
            </div>
            <div className="compact-product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <ProductScrollRow
              title="Fresh Groceries"
              emoji="🍎"
              slug="groceries"
              items={groceriesProducts}
              handleCategorySelect={handleCategorySelect}
            />
            <ProductScrollRow
              title="Hot Restaurant Favorites"
              emoji="🍔"
              slug="food"
              items={foodProducts}
              handleCategorySelect={handleCategorySelect}
            />
            <ProductScrollRow
              title="Trendy Fashion & Streetwear"
              emoji="👕"
              slug="clothing"
              items={fashionProducts}
              handleCategorySelect={handleCategorySelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
