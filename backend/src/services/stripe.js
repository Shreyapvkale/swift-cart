const Stripe = require('stripe');

let stripe = null;
const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock');

if (!isMock) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('Stripe initialized successfully with secret credentials.');
  } catch (err) {
    console.error('Stripe failed to initialize. Reverting to mock simulator:', err.message);
  }
} else {
  console.log('Stripe running in Sandbox Simulator Mode.');
}

async function createPaymentIntent(amount, currency = 'inr') {
  if (isMock || !stripe) {
    // Return standard mock payment structure
    return {
      id: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_mock_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount,
      currency,
      status: 'requires_payment_method',
      isMock: true
    };
  }

  // Create real Stripe payment intent
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency: currency.toLowerCase(),
    metadata: { integration: 'swiftcart_superapp' }
  });
}

async function refundPayment(paymentId, amount) {
  if (isMock || !stripe || paymentId.startsWith('pi_mock_')) {
    return {
      id: `re_mock_${Math.random().toString(36).substring(2, 15)}`,
      amount,
      status: 'succeeded',
      isMock: true
    };
  }

  return await stripe.refunds.create({
    paymentIntent: paymentId,
    amount: Math.round(amount * 100)
  });
}

module.exports = {
  createPaymentIntent,
  refundPayment,
  isMock
};
