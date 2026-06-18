const express = require('express');
const authenticate = require('../middleware/auth');
const { createPaymentIntent, refundPayment } = require('../services/stripe');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// @route   POST /api/payments/create-intent
router.post('/payments/create-intent', authenticate, async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Payment amount is required.' });

    const intent = await createPaymentIntent(amount, currency);
    res.status(200).json({
      success: true,
      clientSecret: intent.client_secret,
      id: intent.id,
      isMock: intent.isMock || false
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/webhook (Stripe Webhook mock / live listener)
router.post('/payments/webhook', async (req, res, next) => {
  try {
    // Standard mock response for webhooks in prototype
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/refund
router.post('/payments/refund', authenticate, async (req, res, next) => {
  try {
    const { paymentId, amount } = req.body;
    if (!paymentId || !amount) {
      return res.status(400).json({ success: false, message: 'paymentId and amount are required.' });
    }

    const refund = await refundPayment(paymentId, amount);
    res.status(200).json({ success: true, refund });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
