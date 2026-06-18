const express = require('express');

const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();
const prisma = require('../services/db');

// @route   GET /api/admin/dashboard-stats
router.get('/admin/dashboard-stats', authenticate, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    // 1. Gather KPIs
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    
    const revenueSum = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true }
    });
    const totalRevenue = revenueSum._sum.total || 0;

    const lowStockAlerts = await prisma.inventory.count({
      where: {
        quantityAvailable: {
          lte: prisma.inventory.fields.lowStockThreshold
        }
      }
    });

    const pendingReturns = await prisma.return.count({
      where: { status: 'REQUESTED' }
    });

    // 2. Fetch last 7 days sales
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const daySales = await prisma.order.aggregate({
        where: {
          createdAt: { gte: d, lt: nextD },
          paymentStatus: 'PAID'
        },
        _sum: { total: true },
        _count: { id: true }
      });

      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: daySales._sum.total || 0,
        orders: daySales._count.id || 0
      });
    }

    // 3. Sales by category
    const ordersByCategory = [
      { category: 'Groceries', value: 45 },
      { category: 'Food & Ready-To-Eat', value: 30 },
      { category: 'Clothing & Fashion', value: 25 }
    ];

    res.status(200).json({
      success: true,
      kpis: {
        totalOrders,
        totalRevenue,
        totalUsers,
        lowStockAlerts,
        pendingReturns
      },
      charts: {
        weeklySales: last7Days,
        ordersByCategory
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/orders
router.get('/admin/orders', authenticate, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await prisma.order.findMany({
      where: filter,
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: { include: { variant: { include: { product: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
router.get('/admin/users', authenticate, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/orders/:id/assign-agent
router.put('/admin/orders/:id/assign-agent', authenticate, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const agent = await prisma.deliveryAgent.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found.' });

    const delivery = await prisma.$transaction(async (tx) => {
      // 1. Delete any existing incomplete delivery assignments for this order
      await tx.delivery.deleteMany({
        where: { orderId: id, deliveredAt: null }
      });

      // 2. Create new assignment
      const d = await tx.delivery.create({
        data: {
          orderId: id,
          agentId,
          estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000) // 25 mins ETA
        }
      });

      // 3. Mark agent unavailable
      await tx.deliveryAgent.update({
        where: { id: agentId },
        data: { isAvailable: false }
      });

      // 4. Update status to CONFIRMED
      await tx.order.update({
        where: { id },
        data: { status: 'CONFIRMED' }
      });

      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status: 'CONFIRMED',
          changedBy: req.user.id,
          note: `Delivery assigned to agent: ${agentId}`
        }
      });

      return d;
    });

    res.status(200).json({ success: true, message: 'Agent successfully assigned.', delivery });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
