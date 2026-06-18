const express = require('express');

const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { notifyOrderUpdate } = require('../services/socket');
const { sendOrderConfirmation } = require('../services/email');

const router = express.Router();
const prisma = require('../services/db');

// @route   POST /api/orders/checkout
router.post('/orders/checkout', authenticate, async (req, res, next) => {
  try {
    const { addressId, couponCode, notes, stripePaymentId, paymentMethod = 'STRIPE' } = req.body;

    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }

    // 1. Fetch address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user.id }
    });
    if (!address) return res.status(404).json({ success: false, message: 'Selected address not found.' });

    // 2. Fetch cart items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { category: true }
                },
                inventory: true
              }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    // 3. Verify stock levels & calculate costs
    let subtotal = 0;
    const orderItemsToCreate = [];

    for (const item of cart.items) {
      const v = item.variant;
      const av = v.inventory ? v.inventory.quantityAvailable : 0;
      if (av < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${v.product.name} (${v.color || ''} ${v.size || ''}). Only ${av} left.`
        });
      }

      const itemTotal = v.price * item.quantity;
      subtotal += itemTotal;

      orderItemsToCreate.push({
        variantId: v.id,
        quantity: item.quantity,
        unitPrice: v.price,
        totalPrice: itemTotal
      });
    }

    // 4. Calculate discount
    let discount = 0;
    let freeDelivery = false;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (coupon.expiresAt === null || coupon.expiresAt > new Date())) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.type === 'PERCENT') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else if (coupon.type === 'FLAT') {
            discount = coupon.value;
          } else if (coupon.type === 'FREE_DELIVERY') {
            freeDelivery = true;
          }

          // Increment coupon usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }
    }

    const deliveryFee = freeDelivery || subtotal > 500 ? 0 : 40; // free above 500 INR
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal - discount + deliveryFee + tax;

    // 5. Execute checkout Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create active order
      const ord = await tx.order.create({
        data: {
          userId: req.user.id,
          addressId,
          status: 'PLACED',
          subtotal,
          discount,
          deliveryFee,
          tax,
          total,
          currency: 'INR',
          paymentStatus: (paymentMethod === 'STRIPE' || paymentMethod === 'UPI') ? 'PAID' : 'PENDING',
          stripePaymentId,
          notes
        }
      });

      // Create order items
      for (const oi of orderItemsToCreate) {
        await tx.orderItem.create({
          data: {
            orderId: ord.id,
            variantId: oi.variantId,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice,
            totalPrice: oi.totalPrice
          }
        });

        // Decrement physical inventory
        await tx.inventory.update({
          where: { variantId: oi.variantId },
          data: {
            quantityAvailable: { decrement: oi.quantity }
          }
        });
      }

      // Record first status log
      await tx.orderStatusLog.create({
        data: {
          orderId: ord.id,
          status: 'PLACED',
          changedBy: req.user.id,
          note: 'Order successfully submitted.'
        }
      });

      // Clear Customer cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return ord;
    });

    // 6. Assign delivery agent for quick-commerce (grocery/food)
    const hasQuickDelivery = cart.items.some(item => 
      item.variant.product.category.type === 'GROCERY' || 
      item.variant.product.category.type === 'FOOD'
    );

    if (hasQuickDelivery) {
      const availableAgent = await prisma.deliveryAgent.findFirst({
        where: { isAvailable: true }
      });

      if (availableAgent) {
        await prisma.delivery.create({
          data: {
            orderId: order.id,
            agentId: availableAgent.id,
            estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000) // 20 mins
          }
        });

        await prisma.deliveryAgent.update({
          where: { id: availableAgent.id },
          data: { isAvailable: false }
        });
      }
    }

    // Trigger confirmation asynchronously
    sendOrderConfirmation(req.user.email, order).catch(err => console.error('Nodemailer async err:', err));

    res.status(201).json({
      success: true,
      message: 'Order successfully placed!',
      orderId: order.id,
      total
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
router.get('/orders/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        id,
        // Role check: ADMIN and DELIVERY can view any order; CUSTOMER can only view their own
        ...(req.user.role !== 'ADMIN' && req.user.role !== 'DELIVERY' ? { userId: req.user.id } : {})
      },
      include: {
        address: true,
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
        statusLogs: {
          orderBy: { timestamp: 'desc' }
        },
        deliveries: {
          include: {
            agent: {
              include: {
                user: { select: { name: true, phone: true, avatarUrl: true } }
              }
            }
          }
        }
      }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order context not found.' });

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/status (admin/delivery/vendor)
router.put('/orders/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { deliveries: true }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Validate update privilege
    if (req.user.role === 'CUSTOMER') {
      return res.status(403).json({ success: false, message: 'Unauthorized operation.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: { status }
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status,
          changedBy: req.user.id,
          note: note || `Order transitioned to: ${status}`
        }
      });

      // Handle delivery agent status updates
      if (status === 'DELIVERED') {
        const activeDelivery = order.deliveries.find(d => !d.deliveredAt);
        if (activeDelivery) {
          await tx.delivery.update({
            where: { id: activeDelivery.id },
            data: { deliveredAt: new Date() }
          });

          if (activeDelivery.agentId) {
            await tx.deliveryAgent.update({
              where: { id: activeDelivery.agentId },
              data: { isAvailable: true }
            });
          }
        }
      }

      return o;
    });

    // Real-time socket notify
    notifyOrderUpdate(id, status, note);

    res.status(200).json({ success: true, message: `Status updated to ${status}.`, order: updated });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders/:id/cancel
router.post('/orders/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.id },
      include: { items: true }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    
    if (order.status !== 'PLACED') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in state: ${order.status}`
      });
    }

    await prisma.$transaction(async (tx) => {
      // Cancel order
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' }
      });

      // Restock inventory levels
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { quantityAvailable: { increment: item.quantity } }
        });
      }

      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status: 'CANCELLED',
          changedBy: req.user.id,
          note: 'Cancelled by customer.'
        }
      });
    });

    notifyOrderUpdate(id, 'CANCELLED', 'Order cancelled by user.');

    res.status(200).json({ success: true, message: 'Order successfully cancelled.' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders/:id/return
router.post('/orders/:id/return', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Returns can only be requested on delivered items.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: 'RETURNED' }
      });

      await tx.return.create({
        data: {
          orderId: id,
          userId: req.user.id,
          reason: reason || 'Item return request',
          status: 'REQUESTED',
          refundAmount: order.total
        }
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status: 'RETURNED',
          changedBy: req.user.id,
          note: `Return requested. Reason: ${reason}`
        }
      });
    });

    notifyOrderUpdate(id, 'RETURNED', 'Return initiated.');

    res.status(200).json({ success: true, message: 'Return request successfully recorded.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
