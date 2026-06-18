const express = require('express');

const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();
const prisma = require('../services/db');

// Helper to get vendor ID
async function getVendorProfile(userId) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId }
  });
  return vendor;
}

// @route   GET /api/vendor/products
router.get('/vendor/products', authenticate, roleGuard(['VENDOR']), async (req, res, next) => {
  try {
    const vendor = await getVendorProfile(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: {
        category: true,
        variants: {
          include: { inventory: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/vendor/payouts
router.get('/vendor/payouts', authenticate, roleGuard(['VENDOR']), async (req, res, next) => {
  try {
    const vendor = await getVendorProfile(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });

    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { periodStart: 'desc' }
    });

    // Mock calculations for active performance stats
    const performance = {
      overallRating: 4.8,
      returnRate: '1.2%',
      pendingBalance: 12500,
      totalPaid: payouts.reduce((acc, curr) => curr.status === 'PAID' ? acc + curr.amount : acc, 0)
    };

    res.status(200).json({ success: true, payouts, performance });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
