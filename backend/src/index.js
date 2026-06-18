require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./services/socket');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const vendorRoutes = require('./routes/vendor');
const erpRoutes = require('./routes/erp');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // includes GET /products, /categories
app.use('/api', cartRoutes);    // includes /cart, /cart/items, /cart/apply-coupon
app.use('/api', orderRoutes);   // includes /orders, /orders/checkout, cancel, return
app.use('/api', paymentRoutes); // includes /payments/create-intent, refunds
app.use('/api', userRoutes);    // includes /users/me, /users/me/addresses
app.use('/api', adminRoutes);   // includes /admin/dashboard-stats, assign-agent
app.use('/api', vendorRoutes);  // includes /vendor/products, /vendor/payouts
app.use('/api', erpRoutes);     // includes /erp/products/import, /erp/inventory/sync, etc.

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'swiftcart-api', timestamp: new Date() });
});

// Global Error Handler (Must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 SwiftCart API Server running on port ${PORT}`);
  console.log(`⚡ Real-time Socket.io active`);
  console.log(`🔧 Sandbox simulations ready for Stripe & Nodemailer`);
  console.log(`===================================================`);
});
