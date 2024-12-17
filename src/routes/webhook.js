const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const User = require('../models/User');

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await User.findOneAndUpdate(
        { 'subscription.stripeSubscriptionId': subscription.id },
        {
          'subscription.status': subscription.status,
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
        }
      );
      break;
  }

  res.json({received: true});
});

module.exports = router;