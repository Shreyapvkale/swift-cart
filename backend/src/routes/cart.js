const express = require('express');

const authenticate = require('../middleware/auth');

const router = express.Router();
const prisma = require('../services/db');

// Helper to get or create cart
async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              inventory: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventory: true
              }
            }
          }
        }
      }
    });
  }
  return cart;
}

// @route   GET /api/cart
router.get('/cart', authenticate, async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/cart/items
router.post('/cart/items', authenticate, async (req, res, next) => {
  try {
    const { variantId, quantity = 1 } = req.body;
    if (!variantId) {
      return res.status(400).json({ success: false, message: 'variantId is required' });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Verify stock availability
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true }
    });

    if (!variant) return res.status(404).json({ success: false, message: 'Product variant not found.' });

    const totalQty = parseInt(quantity);
    const available = variant.inventory ? variant.inventory.quantityAvailable : 0;
    
    if (available < totalQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${available} units available.`
      });
    }

    // Check if variant already in cart
    const existingItem = cart.items.find(item => item.variantId === variantId);

    if (existingItem) {
      const newQty = existingItem.quantity + totalQty;
      if (available < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Max available stock is ${available}.`
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity: totalQty
        }
      });
    }

    const updatedCart = await getOrCreateCart(req.user.id);
    res.status(200).json({ success: true, message: 'Item added to cart.', cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/cart/items/:id
router.put('/cart/items/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params; // cart item ID
    const { quantity } = req.body;

    if (quantity === undefined || parseInt(quantity) < 1) {
      return res.status(400).json({ success: false, message: 'Valid quantity greater than zero is required.' });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        variant: {
          include: { inventory: true }
        }
      }
    });

    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found.' });

    // Validate stock
    const available = item.variant.inventory ? item.variant.inventory.quantityAvailable : 0;
    if (available < parseInt(quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${available} units available.`
      });
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity) }
    });

    const updatedCart = await getOrCreateCart(req.user.id);
    res.status(200).json({ success: true, message: 'Cart updated.', cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart/items/:id
router.delete('/cart/items/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id } });
    const updatedCart = await getOrCreateCart(req.user.id);
    res.status(200).json({ success: true, message: 'Item removed from cart.', cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart
router.delete('/cart', authenticate, async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    const updatedCart = await getOrCreateCart(req.user.id);
    res.status(200).json({ success: true, message: 'Cart cleared successfully.', cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/cart/apply-coupon
router.post('/cart/apply-coupon', authenticate, async (req, res, next) => {
  try {
    const { code, orderSubtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required.' });

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive promotional code.' });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    }

    if (orderSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Min order requirement not met. Order must be at least ${coupon.minOrder}.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully!',
      coupon
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
