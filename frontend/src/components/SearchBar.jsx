import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, Grid, Loader2, X, ArrowRight } from 'lucide-react';
import api from '../services/api';
import uiStore from '../store/uiStore';
import useDebounce from '../hooks/useDebounce';

export default function SearchBar({ placeholder = "Search groceries, fast food, clothing...", className = "w-full md:max-w-md" }) {
  const navigate = useNavigate();
  const { formatPrice } = uiStore();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [liveResults, setLiveResults] = useState([]);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Fetch trending products & categories on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch top 5 products (trending)
        const prodRes = await api.get('/api/products', { params: { limit: 5 } });
        if (prodRes.data?.success) {
          setTrendingProducts(prodRes.data.products.slice(0, 5));
        }
        
        // Fetch parent categories
        const catRes = await api.get('/api/categories');
        if (catRes.data?.success) {
          setCategories(catRes.data.categories.filter(c => !c.parentId).slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load dropdown suggestion data', err);
      }
    };
    fetchDropdownData();
  }, []);

  // Live search when debounced query changes
  useEffect(() => {
    const performLiveSearch = async () => {
      if (!debouncedQuery.trim()) {
        setLiveResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const { data } = await api.get('/api/products', {
          params: { q: debouncedQuery, limit: 5 }
        });
        if (data?.success) {
          setLiveResults(data.products);
        }
      } catch (err) {
        console.error('Live search failed', err);
      } finally {
        setLoading(false);
      }
    };
    performLiveSearch();
  }, [debouncedQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearch = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    saveSearch(query);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    saveSearch(term);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleCategoryClick = (slug) => {
    setIsOpen(false);
    navigate(`/search?category=${encodeURIComponent(slug)}`);
  };

  const handleProductClick = (slug) => {
    setIsOpen(false);
    navigate(`/product/${slug}`);
  };

  // Helper to escape regex special chars
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Helper to bold search query in results
  const highlightQuery = (text, queryText) => {
    if (!queryText.trim()) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(queryText)})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === queryText.toLowerCase() 
            ? <strong key={i} className="font-extrabold text-blue-600">{part}</strong>
            : part
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={18} />
        </span>
        <input
          type="text"
          ref={inputRef}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setLiveResults([]);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-dark transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-card shadow-hover border border-gray-150 z-50 overflow-hidden max-h-[480px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* STATE 1: Empty Query state */}
          {!query.trim() ? (
            <div className="p-5 space-y-5">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Clock size={13} /> Recent Searches</span>
                    <button type="button" onClick={clearRecent} className="hover:text-red-500 transition-colors">Clear All</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleRecentClick(term)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-pill text-xs font-semibold text-dark transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Now */}
              {trendingProducts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={13} /> Trending Now
                  </h4>
                  <div className="divide-y divide-gray-50">
                    {trendingProducts.map((prod) => {
                      const price = prod.variants?.[0]?.price || 0;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleProductClick(prod.slug)}
                          className="w-full flex items-center gap-3 py-2 text-left hover:bg-gray-50/80 rounded-md px-1 transition-colors"
                        >
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'}
                            alt={prod.name}
                            className="w-8 h-8 rounded object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold text-dark truncate">{prod.name}</p>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{prod.brand}</span>
                          </div>
                          <span className="text-xs font-extrabold text-dark flex-shrink-0">{formatPrice(price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category Quick Links */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Grid size={13} /> Shop by Category
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-100 hover:border-blue-500 hover:bg-blue-50/30 rounded-btn text-xs font-bold text-dark transition-all text-left"
                      >
                        <span>{cat.iconUrl}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // STATE 2: Typing query state
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                  <Loader2 className="animate-spin text-primary" size={20} />
                  <span className="text-xs font-semibold">Searching live catalog...</span>
                </div>
              ) : liveResults.length > 0 ? (
                <div>
                  <div className="p-3 divide-y divide-gray-50">
                    {liveResults.map((prod) => {
                      const price = prod.variants?.[0]?.price || 0;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleProductClick(prod.slug)}
                          className="w-full flex items-center gap-3 py-2 text-left hover:bg-gray-50/80 rounded-md px-2 transition-colors"
                        >
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'}
                            alt={prod.name}
                            className="w-10 h-10 rounded object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold text-dark truncate">
                              {highlightQuery(prod.name, query)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">
                                {prod.category?.name}
                              </span>
                              {prod.brand && (
                                <span className="text-[9px] font-semibold text-gray-400">
                                  {prod.brand}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-dark flex-shrink-0">
                            {formatPrice(price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* See all results link */}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-3 bg-gray-50 hover:bg-blue-50 text-xs font-bold text-blue-600 border-t border-gray-100 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    See all results for "{query}" <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                // STATE 3: No live results found
                <div className="p-5 text-center space-y-4">
                  <div>
                    <span className="text-2xl">🔍</span>
                    <p className="text-xs font-bold text-dark mt-1">No matches found for "{query}"</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Check for typos or try popular categories below</p>
                  </div>
                  
                  {/* Categories suggestions in empty state */}
                  {categories.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Suggested Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategoryClick(cat.slug)}
                            className="px-2.5 py-1 border border-gray-100 hover:border-blue-500 rounded-pill text-[11px] font-bold text-dark transition-colors"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending products suggestion */}
                  {trendingProducts.length > 0 && (
                    <div className="space-y-2 text-left pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested for You</p>
                      <div className="grid grid-cols-1 gap-1">
                        {trendingProducts.slice(0, 3).map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleProductClick(prod.slug)}
                            className="flex items-center gap-2 py-1.5 hover:bg-gray-50 rounded text-left px-1.5 transition-colors"
                          >
                            <img
                              src={prod.images?.[0]}
                              className="w-6 h-6 rounded object-cover flex-shrink-0 border border-gray-100"
                              alt=""
                            />
                            <span className="text-[11px] font-semibold text-dark truncate flex-grow">{prod.name}</span>
                            <span className="text-[11px] font-bold text-dark">{formatPrice(prod.variants?.[0]?.price || 0)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
