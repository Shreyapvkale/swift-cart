const express = require('express');


const router = express.Router();
const prisma = require('../services/db');

const ERP_API_KEY = process.env.ERP_API_KEY || 'swiftcart_erp_secure_key_2026!';

// Middleware to secure ERP endpoints
function secureERP(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== ERP_API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid or missing ERP x-api-key header.'
    });
  }
  next();
}

// @route   POST /api/erp/products/import
router.post('/erp/products/import', secureERP, async (req, res, next) => {
  try {
    const productsArray = req.body; // JSON array of products

    if (!Array.isArray(productsArray)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: Array expected.' });
    }

    const importedCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      const defaultVendor = await tx.vendor.findFirst();
      const defaultCategory = await tx.category.findFirst({ where: { parentId: null } });

      for (const item of productsArray) {
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(8);
        const sku = item.sku || `ERP-${Math.random().toString(36).substring(7).toUpperCase()}`;

        const prod = await tx.product.create({
          data: {
            vendorId: item.vendorId || defaultVendor.id,
            categoryId: item.categoryId || defaultCategory.id,
            name: item.name,
            slug,
            description: item.description || item.name,
            brand: item.brand,
            sku,
            images: item.images || ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'],
            tags: item.tags || [],
            status: 'ACTIVE'
          }
        });

        const variant = await tx.productVariant.create({
          data: {
            productId: prod.id,
            size: item.size,
            color: item.color,
            price: parseFloat(item.price || 100),
            comparePrice: item.comparePrice ? parseFloat(item.comparePrice) : null,
            skuVariant: `${sku}-V1`
          }
        });

        await tx.inventory.create({
          data: {
            variantId: variant.id,
            warehouseId: item.warehouseId || (await tx.warehouse.findFirst()).id,
            quantityAvailable: parseInt(item.quantity || 50),
            quantityReserved: 0,
            lowStockThreshold: 5
          }
        });

        count++;
      }
      return count;
    });

    res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} items into the system.`,
      importedCount
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/erp/inventory/sync
router.post('/erp/inventory/sync', secureERP, async (req, res, next) => {
  try {
    const { skuVariant, quantityAvailable } = req.body;

    if (!skuVariant || quantityAvailable === undefined) {
      return res.status(400).json({ success: false, message: 'Fields required: skuVariant, quantityAvailable' });
    }

    const variant = await prisma.productVariant.findUnique({
      where: { skuVariant }
    });

    if (!variant) {
      return res.status(404).json({ success: false, message: `Product variant with SKU: ${skuVariant} not found.` });
    }

    const updatedInventory = await prisma.inventory.update({
      where: { variantId: variant.id },
      data: {
        quantityAvailable: parseInt(quantityAvailable)
      }
    });

    res.status(200).json({
      success: true,
      message: `Inventory successfully synchronized for ${skuVariant}.`,
      updatedInventory
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/erp/orders/export
router.get('/erp/orders/export', secureERP, async (req, res, next) => {
  try {
    const { status = 'CONFIRMED' } = req.query;

    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        items: {
          include: {
            variant: { select: { skuVariant: true, price: true } }
          }
        },
        address: true,
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/erp/purchase-orders
router.post('/erp/purchase-orders', secureERP, async (req, res, next) => {
  try {
    const { vendorId, items, totalCost } = req.body;

    if (!vendorId || !items || !totalCost) {
      return res.status(400).json({ success: false, message: 'Fields required: vendorId, items, totalCost' });
    }

    const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    const po = await prisma.purchaseOrder.create({
      data: {
        vendorId,
        adminId: defaultAdmin.id,
        items,
        totalCost: parseFloat(totalCost),
        status: 'SENT'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Purchase Order registered successfully from ERP trigger.',
      po
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
