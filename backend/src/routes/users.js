const express = require('express');

const authenticate = require('../middleware/auth');

const router = express.Router();
const prisma = require('../services/db');

// @route   GET /api/users/me
router.get('/users/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true
      }
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me
router.put('/users/me', authenticate, async (req, res, next) => {
  try {
    const { name, phone, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, avatarUrl }
    });

    res.status(200).json({
      success: true,
      message: 'Profile details updated.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/addresses
router.get('/users/me/addresses', authenticate, async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' }
    });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/me/addresses
router.post('/users/me/addresses', authenticate, async (req, res, next) => {
  try {
    const { label, line1, line2, city, state, country, zip, isDefault, lat, lng } = req.body;

    if (!label || !line1 || !city || !country || !zip) {
      return res.status(400).json({ success: false, message: 'All standard address fields are required.' });
    }

    // If marked as default, clear existing defaults first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        line1,
        line2,
        city,
        state,
        country,
        zip,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isDefault: isDefault || false
      }
    });

    res.status(201).json({ success: true, message: 'Address created.', address: newAddress });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me/addresses/:id
router.put('/users/me/addresses/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, line1, line2, city, state, country, zip, isDefault, lat, lng } = req.body;

    const address = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        label,
        line1,
        line2,
        city,
        state,
        country,
        zip,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isDefault: isDefault || false
      }
    });

    res.status(200).json({ success: true, message: 'Address successfully updated.', address: updated });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/me/addresses/:id
router.delete('/users/me/addresses/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    await prisma.address.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Address removed successfully.' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/dashboard-summary
router.get('/users/me/dashboard-summary', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // total orders count
    const totalOrdersCount = await prisma.order.count({ where: { userId } });
    
    // wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true, name: true }
    });
    const walletBalance = user?.walletBalance || 0;

    // wishlist count
    const wishlistCount = await prisma.wishlist.count({ where: { userId } });

    // active coupons available
    const couponsCount = await prisma.coupon.count({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    // 2 best available coupons
    const bestCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { value: 'desc' },
      take: 2
    });

    // Active orders (not delivered, cancelled, returned)
    const activeOrders = await prisma.order.findMany({
      where: {
        userId,
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'RETURNED']
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 2
    });

    // Recent orders (last 3)
    const recentOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    res.status(200).json({
      success: true,
      summary: {
        name: user?.name,
        totalOrders: totalOrdersCount,
        couponsAvailable: couponsCount,
        walletBalance,
        wishlistItemsCount: wishlistCount,
        activeOrders: activeOrders.map(o => ({
          id: o.id,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          itemsSummary: o.items.map(item => `${item.variant.product.name} x${item.quantity}`).join(', ')
        })),
        recentOrders: recentOrders.map(o => {
          const firstItem = o.items[0];
          const product = firstItem?.variant?.product;
          return {
            id: o.id,
            status: o.status,
            total: o.total,
            createdAt: o.createdAt,
            thumbnailUrl: (product && product.images) ? product.images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100',
            productName: product ? product.name : 'Unknown Product',
            itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0)
          };
        }),
        bestCoupons
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/orders
router.get('/users/me/orders', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, q } = req.query;

    const where = { userId };

    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        where.status = { notIn: ['DELIVERED', 'CANCELLED', 'RETURNED'] };
      } else {
        where.status = status;
      }
    }

    if (q) {
      where.OR = [
        { id: { contains: q } },
        {
          items: {
            some: {
              variant: {
                product: {
                  name: { contains: q }
                }
              }
            }
          }
        }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
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

// @route   GET /api/users/me/orders/:id
router.get('/users/me/orders/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.id },
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

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Mock an agent if active and none exists to display live tracking screen beautifully
    let deliveryDetails = null;
    if (order.deliveries.length > 0) {
      deliveryDetails = order.deliveries[0];
    } else if (['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'].includes(order.status)) {
      // Mock agent for display
      deliveryDetails = {
        id: 'mock-delivery-id',
        agent: {
          rating: 4.8,
          user: {
            name: 'Arjun (Delivery Partner)',
            phone: '+91 98765 43210',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
          }
        },
        estimatedDeliveryTime: new Date(Date.now() + 10 * 60 * 1000),
        liveLat: 28.5682,
        liveLng: 77.3465
      };
    }

    res.status(200).json({ success: true, order, deliveryDetails });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/coupons
router.get('/users/me/coupons', authenticate, async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany();
    const now = new Date();

    const available = coupons.filter(c => c.isActive && (c.expiresAt === null || new Date(c.expiresAt) > now));
    const expired = coupons.filter(c => !c.isActive || (c.expiresAt !== null && new Date(c.expiresAt) <= now));
    // Simulated history
    const applied = coupons.slice(0, 1).map(c => ({ ...c, appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }));

    res.status(200).json({ success: true, available, expired, applied });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/me/coupons/validate
router.post('/users/me/coupons/validate', authenticate, async (req, res, next) => {
  try {
    const { code, cartSubtotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }

    if (cartSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrder} is required for this coupon.`
      });
    }

    res.status(200).json({ success: true, message: 'Coupon is valid!', coupon });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/wishlist
router.get('/users/me/wishlist', authenticate, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            variants: true
          }
        }
      }
    });
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/me/wishlist/:productId
router.post('/users/me/wishlist/:productId', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    if (existing) {
      return res.status(200).json({ success: true, message: 'Product already in wishlist.' });
    }

    const item = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId
      }
    });

    res.status(201).json({ success: true, message: 'Added to wishlist.', item });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/me/wishlist/:productId
router.delete('/users/me/wishlist/:productId', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });
    res.status(200).json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/wallet
router.get('/users/me/wallet', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, walletBalance: true }
    });

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const referralCode = `${initials}2025`;

    const referredCount = await prisma.referral.count({
      where: { referrerId: userId, status: 'PAID' }
    });
    const totalEarnings = referredCount * 50.0;

    res.status(200).json({
      success: true,
      walletBalance: user.walletBalance,
      referrals: {
        code: referralCode,
        count: referredCount,
        earnings: totalEarnings
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/wallet/transactions
router.get('/users/me/wallet/transactions', authenticate, async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = { userId: req.user.id };
    if (type && type !== 'ALL') {
      where.type = type.toUpperCase();
    }

    const transactions = await prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/notifications
router.get('/users/me/notifications', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me/notifications/read-all
router.put('/users/me/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/returns
router.get('/users/me/returns', authenticate, async (req, res, next) => {
  try {
    const returns = await prisma.return.findMany({
      where: { userId: req.user.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  include: { product: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, returns });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/me/returns
router.post('/users/me/returns', authenticate, async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: 'OrderId and reason are required.' });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Can only return delivered orders.' });
    }

    const returnRequest = await prisma.$transaction(async (tx) => {
      const ret = await tx.return.create({
        data: {
          orderId,
          userId: req.user.id,
          reason,
          status: 'APPROVED',
          refundAmount: order.total,
          createdAt: new Date()
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'RETURNED' }
      });

      await tx.orderStatusLog.create({
        data: {
          orderId,
          status: 'RETURNED',
          changedBy: req.user.id,
          note: `Return approved automatically. Reason: ${reason}`
        }
      });

      await tx.user.update({
        where: { id: req.user.id },
        data: {
          walletBalance: { increment: order.total }
        }
      });

      const updatedUser = await tx.user.findUnique({ where: { id: req.user.id } });
      await tx.walletTransaction.create({
        data: {
          userId: req.user.id,
          type: 'CREDIT',
          amount: order.total,
          description: `Refund for Return #${ret.id.slice(0, 8)}`,
          orderId,
          balanceAfter: updatedUser.walletBalance
        }
      });

      return ret;
    });

    res.status(201).json({ success: true, message: 'Return request approved and wallet refunded.', returnRequest });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me/profile
router.put('/users/me/profile', authenticate, async (req, res, next) => {
  try {
    const { name, phone, email, dob, gender } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        email,
        dob: dob ? new Date(dob) : null,
        gender
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile details updated.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/me/avatar
router.post('/users/me/avatar', authenticate, async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    
    // Cloudinary upload simulation
    const finalAvatarUrl = avatarUrl || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 500000000)}?w=150&h=150&fit=crop`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: finalAvatarUrl }
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded and updated.',
      avatarUrl: finalAvatarUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me/password
router.put('/users/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    const bcrypt = require('bcryptjs');
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashed }
    });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/sessions
router.get('/users/me/sessions', authenticate, async (req, res, next) => {
  try {
    const sessions = await prisma.userSession.findMany({
      where: { userId: req.user.id },
      orderBy: { lastActive: 'desc' }
    });
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/me/sessions/all
router.delete('/users/me/sessions/all', authenticate, async (req, res, next) => {
  try {
    await prisma.userSession.deleteMany({
      where: { userId: req.user.id }
    });
    res.status(200).json({ success: true, message: 'All active sessions terminated.' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me/settings/prefs
router.get('/users/me/settings/prefs', authenticate, async (req, res, next) => {
  try {
    let prefs = await prisma.notificationPrefs.findUnique({
      where: { userId: req.user.id }
    });

    if (!prefs) {
      prefs = await prisma.notificationPrefs.create({
        data: { userId: req.user.id }
      });
    }

    res.status(200).json({ success: true, preferences: prefs });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me/settings/prefs
router.put('/users/me/settings/prefs', authenticate, async (req, res, next) => {
  try {
    const { orderUpdates, promoOffers, newArrivals, restockAlerts, viaEmail, viaSms, viaPush } = req.body;
    const prefs = await prisma.notificationPrefs.upsert({
      where: { userId: req.user.id },
      update: { orderUpdates, promoOffers, newArrivals, restockAlerts, viaEmail, viaSms, viaPush },
      create: { userId: req.user.id, orderUpdates, promoOffers, newArrivals, restockAlerts, viaEmail, viaSms, viaPush }
    });
    res.status(200).json({ success: true, message: 'Notification preferences saved.', preferences: prefs });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/me
router.delete('/users/me', authenticate, async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });
    res.status(200).json({ success: true, message: 'Account permanently deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
