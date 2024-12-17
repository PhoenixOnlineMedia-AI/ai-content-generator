const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionService = require('../services/subscriptionService');
const stripe = require('../config/stripe');

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await stripe.prices.list({
      active: true,
      expand: ['data.product']
    });
    res.json(plans.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
});

// Create subscription
router.post('/create', auth, async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    const subscription = await subscriptionService.createSubscription(
      req.user,
      priceId,
      paymentMethodId
    );
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.user);
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;