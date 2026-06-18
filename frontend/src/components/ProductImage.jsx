import React, { useState, useEffect } from 'react';

export default function ProductImage({ src, alt, className = '', category = '', heightClass = 'h-[200px]' }) {
  const [imgSrc, setImgSrc] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [retryStage, setRetryStage] = useState(0); // 0: primary, 1: product-specific fallback, 2: logo placeholder

  // Clean and resolve specific product keywords to get a guaranteed working Unsplash photo
  const getProductSpecificFallback = (nameOrCategory) => {
    const term = typeof nameOrCategory === 'string' ? nameOrCategory.toLowerCase() : '';

    // Groceries
    if (term.includes('apple')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600';
    if (term.includes('banana')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600';
    if (term.includes('spinach')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600';
    if (term.includes('tomato')) return 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600';
    if (term.includes('butter') && !term.includes('chicken')) return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600';
    if (term.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600';
    if (term.includes('bread')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600';
    if (term.includes('yogurt')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600';
    if (term.includes('coca-cola') || term.includes('coke') || term.includes('cola')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600';
    if (term.includes('coconut')) return 'https://images.unsplash.com/photo-1525385133772-255197cf400b?w=600';
    if (term.includes('orange')) return 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600';
    if (term.includes('perrier') || term.includes('sparkling')) return 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=600';
    if (term.includes('pringles')) return 'https://images.unsplash.com/photo-1613968260337-94305436a6ee?w=600';
    if (term.includes('lay\'s') || term.includes('lays') || term.includes('chips') || term.includes('salted')) return 'https://images.unsplash.com/photo-1518047601542-79f18c655718?w=600';
    if (term.includes('almond')) return 'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=600';
    if (term.includes('chocolate') || term.includes('cookie') || term.includes('silk')) return 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600';
    if (term.includes('toothpaste') || term.includes('colgate')) return 'https://images.unsplash.com/photo-1559599141-3815480a826b?w=600';
    if (term.includes('handwash') || term.includes('dettol')) return 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600';
    if (term.includes('cream') || term.includes('nivea')) return 'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?w=600';
    if (term.includes('shampoo')) return 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600';

    // Food/Restaurant
    if (term.includes('butter chicken')) return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600';
    if (term.includes('biryani')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600';
    if (term.includes('tikka') || term.includes('paneer')) return 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600';
    if (term.includes('chole') || term.includes('bhature')) return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600';
    if (term.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600';
    if (term.includes('pasta') || term.includes('alfredo') || term.includes('penne')) return 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600';
    if (term.includes('lasagna')) return 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600';
    if (term.includes('gnocchi') || term.includes('pesto')) return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600';
    if (term.includes('fried rice')) return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600';
    if (term.includes('noodle')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600';
    if (term.includes('dimsum') || term.includes('momo')) return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600';
    if (term.includes('chicken bowl') || term.includes('kung pao')) return 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600';
    if (term.includes('taco')) return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600';
    if (term.includes('burrito')) return 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=600';
    if (term.includes('nachos')) return 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600';
    if (term.includes('quesadilla')) return 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600';
    if (term.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600';
    if (term.includes('wing')) return 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600';
    if (term.includes('sandwich')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600';
    if (term.includes('shake')) return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600';

    // Clothing/Fashion
    if (term.includes('t-shirt') || term.includes('tshirt')) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600';
    if (term.includes('linen shirt')) return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600';
    if (term.includes('oxford shirt')) return 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600';
    if (term.includes('hoodie')) return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600';
    if (term.includes('jeans')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600';
    if (term.includes('jogger') || term.includes('cargo')) return 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600';
    if (term.includes('chino')) return 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600';
    if (term.includes('short')) return 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600';
    if (term.includes('sneaker') || term.includes('shoe')) return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600';
    if (term.includes('runner')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
    if (term.includes('boot')) return 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600';
    if (term.includes('sandal')) return 'https://images.unsplash.com/photo-1603487265989-6bd0a7cd935b?w=600';
    if (term.includes('sunglasses') || term.includes('glasses')) return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600';
    if (term.includes('belt')) return 'https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?w=600';
    if (term.includes('watch')) return 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600';
    if (term.includes('backpack')) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600';
    if (term.includes('onesies')) return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600';
    if (term.includes('dungaree')) return 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600';
    if (term.includes('raincoat')) return 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600';

    // General Fallbacks
    if (term.includes('grocer') || term.includes('fruit') || term.includes('dairy') || term.includes('drink') || term.includes('munch')) {
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';
    }
    if (term.includes('food') || term.includes('eat') || term.includes('dine') || term.includes('meal') || term.includes('restaurant')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';
    }
    if (term.includes('cloth') || term.includes('fashion') || term.includes('wear') || term.includes('accessories')) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
    }

    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';
  };

  useEffect(() => {
    setLoaded(false);
    setRetryStage(0);

    // Check if the image source is missing or is the known broken chips image
    const isKnownBroken = src && (
      src.includes('photo-1566478989037-eec170784d4b') || 
      src.includes('placeholder') || 
      src.includes('example.com') || 
      src.includes('broken')
    );

    if (!src || isKnownBroken) {
      setImgSrc(getProductSpecificFallback(alt || category));
      setRetryStage(1);
    } else {
      setImgSrc(src);
    }
  }, [src, alt, category]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    if (retryStage === 0) {
      // If primary failed, load product-specific fallback from Unsplash
      setRetryStage(1);
      setImgSrc(getProductSpecificFallback(alt || category));
    } else if (retryStage === 1) {
      // If product fallback also failed, render the logo placeholder
      setRetryStage(2);
      setLoaded(true);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} bg-gray-150 overflow-hidden select-none`}>
      {/* Shimmer loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      )}

      {retryStage === 2 ? (
        /* Branded green placeholder with SwiftCart logo centered */
        <div className="absolute inset-0 bg-[#15803D] flex flex-col items-center justify-center p-4">
          <svg viewBox="0 0 100 100" className="w-14 h-14 text-white opacity-90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="26" fill="#166534" />
            <circle cx="50" cy="38" r="11" fill="#FABF14" />
            <path d="M28 68 C28 48, 72 48, 72 68" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <path d="M34 68 H66" stroke="white" strokeWidth="6" strokeLinecap="round" />
            <circle cx="34" cy="74" r="5.5" fill="white" />
            <circle cx="66" cy="74" r="5.5" fill="white" />
          </svg>
          <span className="text-[10px] font-heading font-extrabold text-white tracking-widest mt-2 uppercase opacity-80">
            SwiftCart
          </span>
        </div>
      ) : (
        imgSrc && (
          <img
            src={imgSrc}
            alt={alt || 'Product Image'}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${className} ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )
      )}
    </div>
  );
}

