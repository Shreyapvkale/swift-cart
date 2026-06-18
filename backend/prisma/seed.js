const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed processing...');

  // 1. Clear database
  await prisma.analyticsEvent.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.return.deleteMany({});
  await prisma.orderStatusLog.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.deliveryAgent.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.vendorPayout.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.notificationPrefs.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.banner.deleteMany({});

  console.log('Database cleaned.');

  // 2. Hash default password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Users
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'SwiftCart Admin',
      email: 'admin@swiftcart.com',
      passwordHash,
      phone: '+919999999999',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  // Vendors
  const vendorUser1 = await prisma.user.create({
    data: {
      name: 'SuperMart Groceries Vendor',
      email: 'vendor1@swiftcart.com',
      passwordHash,
      phone: '+918888888888',
      role: 'VENDOR',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      businessName: 'SuperMart & Gourmet Hub',
      gstNumber: 'GSTIN123456789A',
      bankAccount: '123456789012',
      commissionRate: 0.08,
      status: 'ACTIVE'
    }
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      name: 'Vogue Apparel Vendor',
      email: 'vendor2@swiftcart.com',
      passwordHash,
      phone: '+917777777777',
      role: 'VENDOR',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      businessName: 'Vogue Trends Ltd',
      gstNumber: 'GSTIN987654321B',
      bankAccount: '987654321098',
      commissionRate: 0.12,
      status: 'ACTIVE'
    }
  });

  // Delivery Agents
  const agentUser1 = await prisma.user.create({
    data: {
      name: 'Rohan Sharma',
      email: 'agent1@swiftcart.com',
      passwordHash,
      phone: '+919666666666',
      role: 'DELIVERY',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  const agent1 = await prisma.deliveryAgent.create({
    data: {
      userId: agentUser1.id,
      vehicleType: 'E-BIKE',
      currentLat: 28.6139,
      currentLng: 77.2090,
      isAvailable: true,
      rating: 4.8
    }
  });

  const agentUser2 = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'agent2@swiftcart.com',
      passwordHash,
      phone: '+919555555555',
      role: 'DELIVERY',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  const agent2 = await prisma.deliveryAgent.create({
    data: {
      userId: agentUser2.id,
      vehicleType: 'MOTORCYCLE',
      currentLat: 28.6250,
      currentLng: 77.2200,
      isAvailable: true,
      rating: 4.9
    }
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Shreya Sen',
      email: 'customer@swiftcart.com',
      passwordHash,
      phone: '+919444444444',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true,
      walletBalance: 320.0
    }
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      phone: '+14155552671',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Maria Garcia',
      email: 'maria@example.com',
      passwordHash,
      phone: '+34600123456',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      isVerified: true
    }
  });

  // Addresses
  const addr1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Home',
      line1: 'B-12, Sector 45',
      line2: 'Near Central Park',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      zip: '201301',
      lat: 28.5672,
      lng: 77.3462,
      isDefault: true
    }
  });

  await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Work',
      line1: 'Tech Tower, Phase 2',
      line2: 'Industrial Area',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      zip: '201305',
      lat: 28.5832,
      lng: 77.3120,
      isDefault: false
    }
  });

  const addr2 = await prisma.address.create({
    data: {
      userId: customer2.id,
      label: 'Home',
      line1: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      zip: '94102',
      lat: 37.7749,
      lng: -122.4194,
      isDefault: true
    }
  });

  // 4. Warehouses
  const whNoida = await prisma.warehouse.create({
    data: {
      name: 'Noida Central Hub',
      city: 'Noida',
      country: 'India',
      lat: 28.5700,
      lng: 77.3200,
      isActive: true
    }
  });

  const whSF = await prisma.warehouse.create({
    data: {
      name: 'Vogue West Coast Warehouse',
      city: 'San Francisco',
      country: 'USA',
      lat: 37.7800,
      lng: -122.4200,
      isActive: true
    }
  });

  // 5. Categories & Subcategories
  const catGroceries = await prisma.category.create({
    data: { name: 'Groceries', slug: 'groceries', type: 'GROCERY', sortOrder: 1, iconUrl: '🥦' }
  });
  const catFood = await prisma.category.create({
    data: { name: 'Food & Ready-To-Eat', slug: 'food', type: 'FOOD', sortOrder: 2, iconUrl: '🍕' }
  });
  const catClothing = await prisma.category.create({
    data: { name: 'Clothing & Fashion', slug: 'clothing', type: 'CLOTHING', sortOrder: 3, iconUrl: '👕' }
  });

  // Subcategories
  const subGroceryList = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', iconUrl: '🍎' },
    { name: 'Dairy & Bread', slug: 'dairy-bread', iconUrl: '🥛' },
    { name: 'Cold Drinks & Juices', slug: 'cold-drinks-juices', iconUrl: '🧃' },
    { name: 'Munchies & Chips', slug: 'munchies-chips', iconUrl: '🍿' },
    { name: 'Personal Care', slug: 'personal-care', iconUrl: '🧴' }
  ];
  const subFoodList = [
    { name: 'Indian Cuisine', slug: 'indian', iconUrl: '🍛' },
    { name: 'Italian Dishes', slug: 'italian', iconUrl: '🍝' },
    { name: 'Chinese Bowls', slug: 'chinese', iconUrl: '🥢' },
    { name: 'Mexican Tacos', slug: 'mexican', iconUrl: '🌮' },
    { name: 'American Fast Food', slug: 'american', iconUrl: '🍔' }
  ];
  const subClothingList = [
    { name: 'Topwear', slug: 'topwear', iconUrl: '👕' },
    { name: 'Bottomwear', slug: 'bottomwear', iconUrl: '👖' },
    { name: 'Footwear', slug: 'footwear', iconUrl: '👟' },
    { name: 'Accessories', slug: 'accessories', iconUrl: '🕶️' },
    { name: 'Kids Wear', slug: 'kids-wear', iconUrl: '👶' }
  ];

  const subGroceryIds = [];
  const subFoodIds = [];
  const subClothingIds = [];

  for (const s of subGroceryList) {
    const sub = await prisma.category.create({
      data: { ...s, parentId: catGroceries.id, type: 'GROCERY' }
    });
    subGroceryIds.push(sub);
  }
  for (const s of subFoodList) {
    const sub = await prisma.category.create({
      data: { ...s, parentId: catFood.id, type: 'FOOD' }
    });
    subFoodIds.push(sub);
  }
  for (const s of subClothingList) {
    const sub = await prisma.category.create({
      data: { ...s, parentId: catClothing.id, type: 'CLOTHING' }
    });
    subClothingIds.push(sub);
  }

  // 6. Seed 60 Products
  console.log('Generating catalog products...');

  // Helper arrays for generation
  const groceryItems = [
    { name: 'Fresh Royal Gala Apples', brand: 'FarmFresh', subIdx: 0, desc: 'Sweet, crisp, and nutrient-dense gala apples, imported directly from global orchards.', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600', unit: 'g', price: 120, compare: 150, wt: 500 },
    { name: 'Organic Bananas Bunch', brand: 'FarmFresh', subIdx: 0, desc: 'Fresh yellow organic bananas, packed with energy and potassium.', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600', unit: 'pcs', price: 60, compare: 80, wt: 6 },
    { name: 'Fresh Hydroponic Spinach', brand: 'GrownLocal', subIdx: 0, desc: 'Clean, sand-free hydroponic baby spinach leaves. Rich in iron.', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600', unit: 'g', price: 45, compare: 60, wt: 200 },
    { name: 'Red Cherry Tomatoes', brand: 'FarmFresh', subIdx: 0, desc: 'Juicy, plump cherry tomatoes perfect for salads and cooking.', img: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600', unit: 'g', price: 80, compare: 99, wt: 250 },
    
    { name: 'Amul Salted Butter', brand: 'Amul', subIdx: 1, desc: 'Classic salted table butter loved across generations.', img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600', unit: 'g', price: 275, compare: 290, wt: 500 },
    { name: 'Premium Full Cream Milk 1L', brand: 'Mother Dairy', subIdx: 1, desc: 'Pasteurized homogenized high-fat premium milk.', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600', unit: 'ml', price: 68, compare: 70, wt: 1000 },
    { name: 'Gourmet Sourdough Bread', brand: 'TheBakehouse', subIdx: 1, desc: 'Crusty, artisanal sourdough bread baked fresh daily.', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', unit: 'g', price: 150, compare: 180, wt: 400 },
    { name: 'Greek Yogurt Natural', brand: 'Epigamia', subIdx: 1, desc: 'Thick, creamy natural unsweetened high-protein yogurt.', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', unit: 'g', price: 90, compare: 110, wt: 200 },
    
    { name: 'Coca-Cola Zero Sugar Can', brand: 'Coca-Cola', subIdx: 2, desc: 'Zero calories, zero sugar, great original taste.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600', unit: 'ml', price: 40, compare: 40, wt: 330 },
    { name: 'Premium Tender Coconut Water', brand: 'PureNectar', subIdx: 2, desc: '100% natural, refreshing coconut water packed with electrolytes.', img: 'https://images.unsplash.com/photo-1525385133772-255197cf400b?w=600', unit: 'ml', price: 75, compare: 89, wt: 200 },
    { name: 'Fresh Orange Juice (No Added Sugar)', brand: 'RealFruit', subIdx: 2, desc: 'Pure squeezed fresh cold-pressed orange juice.', img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600', unit: 'ml', price: 120, compare: 149, wt: 1000 },
    { name: 'Perrier Sparkling Water Can', brand: 'Perrier', subIdx: 2, desc: 'Premium natural sparkling mineral water.', img: 'https://images.unsplash.com/photo-1603266747964-629b824dbbaf?w=600', unit: 'ml', price: 160, compare: 180, wt: 330 },
    
    { name: 'Pringles Sour Cream & Onion', brand: 'Pringles', subIdx: 3, desc: 'Flavored potato chips in our signature resealable canister.', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d4b?w=600', unit: 'g', price: 135, compare: 145, wt: 100 },
    { name: 'Lay\'s Classic Salted Family Pack', brand: 'Lays', subIdx: 3, desc: 'Thin and crispy salted potato chips, the perfect snack.', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d4b?w=600', unit: 'g', price: 50, compare: 50, wt: 130 },
    { name: 'Roasted Almonds Salted', brand: 'NuttyDelight', subIdx: 3, desc: 'Crunchy premium California almonds, lightly salted.', img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=600', unit: 'g', price: 299, compare: 350, wt: 200 },
    { name: 'Dark Chocolate Cookie Chunk', brand: 'TheBakehouse', subIdx: 3, desc: 'Thick cookies loaded with chunks of rich 70% dark chocolate.', img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600', unit: 'g', price: 120, compare: 140, wt: 150 },
    
    { name: 'Colgate MaxFresh Gel toothpaste', brand: 'Colgate', subIdx: 4, desc: 'Spicy fresh gel toothpaste with cooling crystals.', img: 'https://images.unsplash.com/photo-1559599141-3815480a826b?w=600', unit: 'g', price: 110, compare: 125, wt: 150 },
    { name: 'Dettol Liquid Handwash Original', brand: 'Dettol', subIdx: 4, desc: 'Trusted germ protection formula for clean, healthy hands.', img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', unit: 'ml', price: 99, compare: 109, wt: 200 },
    { name: 'Nivea Soft Moisturizing Cream', brand: 'Nivea', subIdx: 4, desc: 'Light, fast-absorbing all-purpose cream with jojoba oil.', img: 'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?w=600', unit: 'ml', price: 240, compare: 270, wt: 100 },
    { name: 'Head & Shoulders Cool Menthol Shampoo', brand: 'Head & Shoulders', subIdx: 4, desc: 'Dandruff protection with an invigorating cooling sensation.', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600', unit: 'ml', price: 349, compare: 399, wt: 340 }
  ];

  const foodItems = [
    { name: 'Butter Chicken with Butter Naan', brand: 'Zaika Junction', subIdx: 0, desc: 'Rich, creamy tomato gravy chicken paired with a warm clay oven butter naan.', img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600', price: 320, prep: 20 },
    { name: 'Dum Biryani Feast (Chicken)', brand: 'Biryani Darbar', subIdx: 0, desc: 'Authentic Hyderabadi basmati rice biryani cooked under dum with herbs and saffron.', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600', price: 380, prep: 25 },
    { name: 'Paneer Tikka Platter', brand: 'Zaika Junction', subIdx: 0, desc: 'Charcoal grilled cottage cheese cubes marinated in rich Indian spices.', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600', price: 280, prep: 15 },
    { name: 'Chole Bhature Combo', brand: 'Pindi Rasoi', subIdx: 0, desc: 'Spiced chickpeas curry served with two large fluffy deep-fried bhaturas.', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600', price: 160, prep: 15 },
    
    { name: 'Wood-fired Pizza Margherita', brand: 'Gusto Italiano', subIdx: 1, desc: 'San Marzano tomatoes, fresh mozzarella, fresh basil leaves, extra virgin olive oil.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', price: 399, prep: 18 },
    { name: 'Creamy Penne Alfredo Chicken', brand: 'Gusto Italiano', subIdx: 1, desc: 'Tender pasta in heavy cream, garlic, and parmesan sauce with grilled chicken.', img: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600', price: 350, prep: 15 },
    { name: 'Classic Lasagna Bolognese', brand: 'Bella Italia', subIdx: 1, desc: 'Layered sheet pasta baked with rich minced meat ragu, bechamel, and fresh cheese.', img: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600', price: 420, prep: 22 },
    { name: 'Vegetable Pesto Gnocchi', brand: 'Bella Italia', subIdx: 1, desc: 'Soft potato gnocchi tossed in vibrant green basil and pine nut pesto sauce.', img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600', price: 299, prep: 12 },
    
    { name: 'Schezwan Fried Rice with Manchurian', brand: 'Wok Works', subIdx: 2, desc: 'Spicy wok-tossed fried rice served with dry deep-fried veggie Manchurian balls.', img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600', price: 260, prep: 15 },
    { name: 'Classic Hakka Noodles Veg', brand: 'Wok Works', subIdx: 2, desc: 'Wok-tossed noodles with shredded cabbage, carrots, capsicum, and light soy.', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600', price: 220, prep: 12 },
    { name: 'Pan-fried Dimsums (Veg)', brand: 'Dimsum Corner', subIdx: 2, desc: 'Crispy bottom steamed momos filled with seasoned mixed cabbage and onions.', img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600', price: 180, prep: 15 },
    { name: 'Kung Pao Chicken Bowls', brand: 'Dimsum Corner', subIdx: 2, desc: 'Stir-fried sweet-savory chicken with peanuts, scallions, and dried chilies over jasmine rice.', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600', price: 340, prep: 18 },
    
    { name: 'Crispy Taco Shells Platter (3 pcs)', brand: 'Taco Loco', subIdx: 3, desc: 'Trio of corn shells stuffed with seasoned beans, cheese, guacamole, salsa.', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600', price: 240, prep: 10 },
    { name: 'Grilled Chicken Burrito Wrap', brand: 'Taco Loco', subIdx: 3, desc: 'Giant flour tortilla stuffed with cilantro lime rice, beans, sour cream, and juicy chicken.', img: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=600', price: 290, prep: 12 },
    { name: 'Loaded Cheese Nachos Super', brand: 'Cantina Mexicana', subIdx: 3, desc: 'Tortilla chips baked with hot cheese sauce, jalapenos, olives, and black beans.', img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600', price: 210, prep: 8 },
    { name: 'Quesadilla Supreme (Veg)', brand: 'Cantina Mexicana', subIdx: 3, desc: 'Griddled folded tortilla loaded with melted jack cheese, peppers, and sweet corn.', img: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600', price: 230, prep: 10 },
    
    { name: 'Classic Gourmet Beef Burger', brand: 'Burger HQ', subIdx: 4, desc: 'Grilled smashed beef patty with cheddar cheese, crisp lettuce, brioche bun, and fries.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', price: 299, prep: 15 },
    { name: 'American Crispy Chicken Wings (8 pcs)', brand: 'Burger HQ', subIdx: 4, desc: 'Fried juicy chicken wings glazed in sticky spicy smoky barbecue sauce.', img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600', price: 260, prep: 15 },
    { name: 'Club Sandwich & Peri-Peri Fries', brand: 'NYC Delicatessen', subIdx: 4, desc: 'Double-decker toasted sandwich with turkey slice, bacon, tomatoes, lettuce, egg.', img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600', price: 250, prep: 12 },
    { name: 'Thick New York Style Cheese Shake', brand: 'NYC Delicatessen', subIdx: 4, desc: 'Decadent strawberry cheesecake thick shake topped with real biscuit crumbs.', img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', price: 180, prep: 8 }
  ];

  const clothingItems = [
    { name: 'Premium Oversized Cotton T-Shirt', brand: 'VogueBasic', subIdx: 0, desc: 'Heavyweight 240 GSM organic cotton t-shirt with a modern boxy oversized fit.', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600', price: 999, colors: ['Black', 'Off-White', 'Sage Green'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Artisanal Floral Linen Shirt', brand: 'VogueBasic', subIdx: 0, desc: 'Breathable lightweight premium linen shirt featuring soft watercolor tropical prints.', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', price: 1799, colors: ['Blue', 'White'], sizes: ['M', 'L', 'XL'] },
    { name: 'Casual Slim Fit Oxford Shirt', brand: 'VogueBasic', subIdx: 0, desc: 'Classic Oxford weave long-sleeve cotton shirt. Smart casual wardrobe staple.', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', price: 1499, colors: ['Sky Blue', 'Light Pink'], sizes: ['S', 'M', 'L', 'XL'] },
    { name: 'Cozy Knit Fleece Hoodie', brand: 'ActiveLife', subIdx: 0, desc: 'Soft brushed cotton inner lining hoodie featuring kangaroo pockets and drawstrings.', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', price: 2299, colors: ['Navy', 'Charcoal'], sizes: ['M', 'L', 'XL', 'XXL'] },
    
    { name: 'Relaxed Fit Indigo Jeans', brand: 'DenimCo', subIdx: 1, desc: 'Sturdy 12oz denim bottomwear featuring a relaxed straight-leg style and vintage wash.', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', price: 2499, colors: ['Dark Wash', 'Light Wash'], sizes: ['30', '32', '34', '36'] },
    { name: 'Urban Cargo Joggers', brand: 'DenimCo', subIdx: 1, desc: 'Premium cotton cargo pants with elasticated ankle cuffs and utility multi-pockets.', img: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600', price: 1899, colors: ['Olive Khaki', 'Stealth Black'], sizes: ['30', '32', '34'] },
    { name: 'Tailored Smart Chinos', brand: 'DenimCo', subIdx: 1, desc: 'Sleek stretch twill flat-front trousers. Transitions easily from desk to dinner.', img: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600', price: 1999, colors: ['Beige', 'Navy Blue'], sizes: ['30', '32', '34', '36'] },
    { name: 'Athletic Workout Shorts', brand: 'ActiveLife', subIdx: 1, desc: 'Moisture-wicking, highly breathable gym shorts with zippered side pockets.', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600', price: 799, colors: ['Space Grey', 'Black'], sizes: ['S', 'M', 'L', 'XL'] },
    
    { name: 'Classic Retro White Sneakers', brand: 'UrbanWalk', subIdx: 2, desc: 'Clean vegan leather cupsole court sneakers. Essential modern fashion.', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', price: 2999, colors: ['White-Gum', 'All-White'], sizes: ['UK7', 'UK8', 'UK9', 'UK10'] },
    { name: 'Breathable Lightweight Runners', brand: 'ActiveLife', subIdx: 2, desc: 'Extremely responsive knitted mesh running shoes with orthopedic foam insoles.', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', price: 3499, colors: ['Neon Green', 'Shadow Black'], sizes: ['UK8', 'UK9', 'UK10'] },
    { name: 'Handcrafted Suede Chelsea Boots', brand: 'UrbanWalk', subIdx: 2, desc: 'Exquisite water-resistant suede chelsea boots with a solid crepe outsole.', img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600', price: 4999, colors: ['Tan Suede', 'Dark Brown'], sizes: ['UK8', 'UK9', 'UK10'] },
    { name: 'Casual Leather Cork Sandals', brand: 'UrbanWalk', subIdx: 2, desc: 'Ergonomic footbed cork slippers wrapped in high-quality tan nubuck leather.', img: 'https://images.unsplash.com/photo-1603487265989-6bd0a7cd935b?w=600', price: 1899, colors: ['Tan', 'Black'], sizes: ['UK7', 'UK8', 'UK9'] },
    
    { name: 'Polarized Wayfarer Sunglasses', brand: 'VogueBasic', subIdx: 3, desc: 'Classic wayfarer design with category-3 polarized UV400 protective lenses.', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', price: 1299, colors: ['Matte Black', 'Tortoise Shell'], sizes: ['Standard'] },
    { name: 'Artisanal Full-Grain Leather Belt', brand: 'VogueBasic', subIdx: 3, desc: '100% genuine vegetable tanned leather belt with a solid brass hardware buckle.', img: 'https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?w=600', price: 999, colors: ['Cognac Brown', 'Noir Black'], sizes: ['32', '34', '36'] },
    { name: 'Minimalist Stainless Steel Watch', brand: 'UrbanWalk', subIdx: 3, desc: 'Ultra-thin sleek quartz movement timepiece featuring a mesh steel strap.', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', price: 3999, colors: ['All Black', 'Silver Blue'], sizes: ['40mm'] },
    { name: 'Water-Resistant Commuter Backpack', brand: 'ActiveLife', subIdx: 3, desc: '15.6 inch padded laptop compartment backpack. Smart organization layouts.', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', price: 2499, colors: ['Heather Grey', 'Charcoal Black'], sizes: ['24L'] },
    
    { name: 'Cotton Unisex Baby Onesies (3 pack)', brand: 'TinyTots', subIdx: 4, desc: 'Buttery-soft organic combed cotton baby clothing bodysuits with snap closures.', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600', price: 899, colors: ['Pastel Mix', 'Neutral Mix'], sizes: ['0-3M', '3-6M', '6-12M'] },
    { name: 'Kids Denim Dungaree Set', brand: 'TinyTots', subIdx: 4, desc: 'Playful cotton inner t-shirt paired with highly durable adjustable denim dungarees.', img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600', price: 1499, colors: ['Classic Indigo', 'Light Wash'], sizes: ['2-3Y', '3-4Y', '4-5Y'] },
    { name: 'Toddler Anti-Slip Canvas Sneakers', brand: 'TinyTots', subIdx: 4, desc: 'Lightweight slip-on canvas shoes featuring safe grippy textured rubber outsoles.', img: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=600', price: 999, colors: ['Cherry Red', 'Navy Blue'], sizes: ['Kids-UK4', 'Kids-UK5', 'Kids-UK6'] },
    { name: 'Kids Hooded Dino Raincoat', brand: 'TinyTots', subIdx: 4, desc: 'Bright waterproof hooded jacket with cute Dino spikes on the back.', img: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600', price: 1199, colors: ['Sunshine Yellow', 'Mint Green'], sizes: ['3-4Y', '4-5Y', '5-6Y'] }
  ];

  let skuCounter = 10000;

  // Seeding Grocery items
  for (let i = 0; i < groceryItems.length; i++) {
    const item = groceryItems[i];
    const subCat = subGroceryIds[item.subIdx];
    const sku = `G-${skuCounter++}`;

    const prod = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: item.desc,
        brand: item.brand,
        sku,
        barcode: `890${skuCounter}789`,
        images: JSON.stringify([item.img]),
        tags: JSON.stringify(['grocery', subCat.slug, 'quick-delivery']),
        status: 'ACTIVE',
        vendorId: vendor1.id,
        categoryId: subCat.id
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: prod.id,
        weight: item.wt,
        unit: item.unit,
        price: item.price,
        comparePrice: item.compare,
        costPrice: Math.round(item.price * 0.7),
        skuVariant: `${sku}-V1`
      }
    });

    await prisma.inventory.create({
      data: {
        variantId: variant.id,
        warehouseId: whNoida.id,
        quantityAvailable: 150,
        quantityReserved: 0,
        lowStockThreshold: 15
      }
    });
  }

  // Seeding Food Items
  for (let i = 0; i < foodItems.length; i++) {
    const item = foodItems[i];
    const subCat = subFoodIds[item.subIdx];
    const sku = `F-${skuCounter++}`;

    const prod = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: item.desc,
        brand: item.brand,
        sku,
        barcode: `890${skuCounter}654`,
        images: JSON.stringify([item.img]),
        tags: JSON.stringify(['food', subCat.slug, 'ready-to-eat', `prep-${item.prep}m`]),
        status: 'ACTIVE',
        vendorId: vendor1.id,
        categoryId: subCat.id
      }
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: prod.id,
        unit: 'serving',
        price: item.price,
        comparePrice: Math.round(item.price * 1.15),
        costPrice: Math.round(item.price * 0.5),
        skuVariant: `${sku}-V1`
      }
    });

    await prisma.inventory.create({
      data: {
        variantId: variant.id,
        warehouseId: whNoida.id,
        quantityAvailable: 80,
        quantityReserved: 0,
        lowStockThreshold: 8
      }
    });
  }

  // Seeding Clothing items
  for (let i = 0; i < clothingItems.length; i++) {
    const item = clothingItems[i];
    const subCat = subClothingIds[item.subIdx];
    const sku = `C-${skuCounter++}`;

    const prod = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: item.desc,
        brand: item.brand,
        sku,
        barcode: `890${skuCounter}321`,
        images: JSON.stringify([item.img]),
        tags: JSON.stringify(['clothing', subCat.slug, 'fashion', 'international-fit']),
        status: 'ACTIVE',
        vendorId: vendor2.id,
        categoryId: subCat.id
      }
    });

    // Create combinations of variants (size & color)
    for (let cIdx = 0; cIdx < item.colors.length; cIdx++) {
      const color = item.colors[cIdx];
      for (let sIdx = 0; sIdx < item.sizes.length; sIdx++) {
        const size = item.sizes[sIdx];
        
        const variant = await prisma.productVariant.create({
          data: {
            productId: prod.id,
            size,
            color,
            unit: 'pcs',
            price: item.price,
            comparePrice: Math.round(item.price * 1.3),
            costPrice: Math.round(item.price * 0.4),
            skuVariant: `${sku}-${color.substring(0,2).toUpperCase()}-${size}`
          }
        });

        await prisma.inventory.create({
          data: {
            variantId: variant.id,
            warehouseId: whSF.id,
            quantityAvailable: 45,
            quantityReserved: 0,
            lowStockThreshold: 5
          }
        });
      }
    }
  }

  console.log('60 products successfully generated.');

  // 7. Seed Coupons
  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10,
      minOrder: 300,
      maxDiscount: 150,
      isActive: true
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'FREESHIP',
      type: 'FREE_DELIVERY',
      value: 0,
      minOrder: 500,
      isActive: true
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'FLAT50',
      type: 'FLAT',
      value: 50,
      minOrder: 400,
      isActive: true
    }
  });

  // 8. Seed Banners
  await prisma.banner.create({
    data: {
      title: 'Mega Flash Sale: Groceries Delivered in 10 Mins!',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=400&q=80',
      link: '/groceries',
      position: 'HOME_HERO',
      isActive: true,
      sortOrder: 1
    }
  });

  await prisma.banner.create({
    data: {
      title: 'Summer Fashion Collection — Flat 30% Off!',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80',
      link: '/clothes',
      position: 'HOME_HERO',
      isActive: true,
      sortOrder: 2
    }
  });

  await prisma.banner.create({
    data: {
      title: 'Deals on Hot Restaurant Favorites',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&h=400&q=80',
      link: '/food',
      position: 'HOME_HERO',
      isActive: true,
      sortOrder: 3
    }
  });

  // 9. Seed Sample Orders
  console.log('Creating sample orders...');

  // Get a variant to purchase
  const sampleVariant = await prisma.productVariant.findFirst({
    where: {
      product: {
        categoryId: {
          in: subGroceryIds.map(x => x.id)
        }
      }
    },
    include: { product: true }
  });

  if (sampleVariant) {
    // Order 1: Placed
    const order1 = await prisma.order.create({
      data: {
        userId: customer1.id,
        addressId: addr1.id,
        status: 'PLACED',
        subtotal: sampleVariant.price * 2,
        discount: 0,
        deliveryFee: 30,
        tax: Math.round(sampleVariant.price * 2 * 0.05),
        total: (sampleVariant.price * 2) + 30 + Math.round(sampleVariant.price * 2 * 0.05),
        currency: 'INR',
        paymentStatus: 'PAID',
        stripePaymentId: 'ch_mock_stripe_123',
        notes: 'Deliver quickly please'
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        variantId: sampleVariant.id,
        quantity: 2,
        unitPrice: sampleVariant.price,
        totalPrice: sampleVariant.price * 2
      }
    });

    await prisma.orderStatusLog.create({
      data: {
        orderId: order1.id,
        status: 'PLACED',
        changedBy: customer1.id,
        note: 'Order initiated by checkout process.'
      }
    });

    // Create a live delivery assignment
    const dev1 = await prisma.delivery.create({
      data: {
        orderId: order1.id,
        agentId: agent1.id,
        estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        liveLat: 28.5680,
        liveLng: 77.3400
      }
    });

    // Order 2: Out For Delivery
    const order2 = await prisma.order.create({
      data: {
        userId: customer1.id,
        addressId: addr1.id,
        status: 'OUT_FOR_DELIVERY',
        subtotal: sampleVariant.price,
        discount: 10, // applied welcome10 mock
        deliveryFee: 0,
        tax: Math.round(sampleVariant.price * 0.05),
        total: sampleVariant.price - 10 + Math.round(sampleVariant.price * 0.05),
        currency: 'INR',
        paymentStatus: 'PAID',
        stripePaymentId: 'ch_mock_stripe_456'
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        variantId: sampleVariant.id,
        quantity: 1,
        unitPrice: sampleVariant.price,
        totalPrice: sampleVariant.price
      }
    });

    await prisma.orderStatusLog.create({
      data: { orderId: order2.id, status: 'PLACED', changedBy: customer1.id }
    });
    await prisma.orderStatusLog.create({
      data: { orderId: order2.id, status: 'CONFIRMED', changedBy: admin.id }
    });
    await prisma.orderStatusLog.create({
      data: { orderId: order2.id, status: 'PACKED', changedBy: admin.id }
    });
    await prisma.orderStatusLog.create({
      data: { orderId: order2.id, status: 'OUT_FOR_DELIVERY', changedBy: agentUser1.id }
    });

    await prisma.delivery.create({
      data: {
        orderId: order2.id,
        agentId: agent1.id,
        pickedAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
        liveLat: 28.5675,
        liveLng: 77.3458
      }
    });

    // Order 3: Delivered
    const order3 = await prisma.order.create({
      data: {
        userId: customer1.id,
        addressId: addr1.id,
        status: 'DELIVERED',
        subtotal: sampleVariant.price * 3,
        discount: 50,
        deliveryFee: 0,
        tax: Math.round(sampleVariant.price * 3 * 0.05),
        total: (sampleVariant.price * 3) - 50 + Math.round(sampleVariant.price * 3 * 0.05),
        currency: 'INR',
        paymentStatus: 'PAID',
        stripePaymentId: 'ch_mock_stripe_789'
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order3.id,
        variantId: sampleVariant.id,
        quantity: 3,
        unitPrice: sampleVariant.price,
        totalPrice: sampleVariant.price * 3
      }
    });

    await prisma.orderStatusLog.create({
      data: { orderId: order3.id, status: 'DELIVERED', changedBy: agentUser1.id }
    });

    await prisma.delivery.create({
      data: {
        orderId: order3.id,
        agentId: agent1.id,
        pickedAt: new Date(Date.now() - 30 * 60 * 1000),
        deliveredAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() - 10 * 60 * 1000)
      }
    });

    // Create review for delivered product
    await prisma.review.create({
      data: {
        userId: customer1.id,
        productId: sampleVariant.productId,
        orderId: order3.id,
        rating: 5,
        title: 'Fresh and Crisp!',
        body: 'Extremely fresh and crunchy apples. Delivered literally in 9 minutes. Will buy again!',
        isVerifiedPurchase: true
      }
    });
  }

  // 10. Seed User Account Portal Specifics
  console.log('Seeding user portal details (wishlists, wallet, referrals, sessions, notification preferences)...');

  // Let's create a few products for wishlist. Let's find two products
  const productsList = await prisma.product.findMany({ take: 3 });
  if (productsList.length > 0) {
    await prisma.wishlist.createMany({
      data: [
        { userId: customer1.id, productId: productsList[0].id },
        { userId: customer1.id, productId: productsList[1].id }
      ]
    });
  }

  // Seed notification preferences
  await prisma.notificationPrefs.create({
    data: {
      userId: customer1.id,
      orderUpdates: true,
      promoOffers: true,
      newArrivals: true,
      restockAlerts: false,
      viaEmail: true,
      viaSms: true,
      viaPush: true
    }
  });

  // Seed sessions
  await prisma.userSession.createMany({
    data: [
      { userId: customer1.id, deviceInfo: 'Chrome on Windows 11 (Current)', ipAddress: '192.168.1.10' },
      { userId: customer1.id, deviceInfo: 'SwiftCart iOS App on iPhone 15', ipAddress: '103.45.21.90', lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { userId: customer1.id, deviceInfo: 'Safari on MacOS Sonoma', ipAddress: '82.12.94.10', lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ]
  });

  // Seed referrals
  // We need 6 referred friends to show referred friends: 6, earnings: 300 (which is 6 * 50)
  // Let's create 6 referred users
  const referredEmails = [
    'friend1@example.com', 'friend2@example.com', 'friend3@example.com',
    'friend4@example.com', 'friend5@example.com', 'friend6@example.com'
  ];
  for (let idx = 0; idx < referredEmails.length; idx++) {
    const friendUser = await prisma.user.create({
      data: {
        name: `Friend ${idx + 1}`,
        email: referredEmails[idx],
        passwordHash,
        phone: `+91900000000${idx}`,
        role: 'CUSTOMER',
        isVerified: true
      }
    });

    await prisma.referral.create({
      data: {
        referrerId: customer1.id,
        referredId: friendUser.id,
        rewardAmount: 50.0,
        status: 'PAID'
      }
    });
  }

  // Seed wallet transactions
  await prisma.walletTransaction.createMany({
    data: [
      { userId: customer1.id, type: 'CREDIT', amount: 50.0, description: 'Welcome Sign-up Bonus', balanceAfter: 50.0, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { userId: customer1.id, type: 'CREDIT', amount: 300.0, description: 'Referral Credits (6 friends)', balanceAfter: 350.0, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { userId: customer1.id, type: 'DEBIT', amount: 30.0, description: 'Debited for Order #SWF-8800', balanceAfter: 320.0, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ]
  });

  // Seed notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        type: 'ORDER_UPDATE',
        title: '🚚 Out for delivery!',
        body: 'Your order #SWF-8821 is out for delivery!',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2 min ago
      },
      {
        userId: customer1.id,
        type: 'PROMO',
        title: '🎟️ New coupon added',
        body: 'New coupon FLAT50 added to your account',
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hr ago
      },
      {
        userId: customer1.id,
        type: 'ORDER_UPDATE',
        title: '✅ Order delivered',
        body: 'Order #SWF-8800 delivered successfully',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      }
    ]
  });


  console.log('Seeder completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
