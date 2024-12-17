const stripe = require('../config/stripe');
const User = require('../models/User');

const SUBSCRIPTION_TIERS = {
  basic: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: {
      monthlyCredits: 100,
      maxWebsites: 1,
      maxTeamMembers: 1,
      internalLinking: false,
      advancedSeo: false,
      customBranding: false,
      apiAccess: false
    }
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      monthlyCredits: 500,
      maxWebsites: 3,
      maxTeamMembers: 3,
      internalLinking: true,
      advancedSeo: true,
      customBranding: true,
      apiAccess: false
    }
  },
  agency: {
    priceId: process.env.STRIPE_AGENCY_PRICE_ID,
    features: {
      monthlyCredits: 2000,
      maxWebsites: 25,
      maxTeamMembers: 10,
      internalLinking: true,
      advancedSeo: true,
      customBranding: true,
      apiAccess: true
    }
  }
};

class SubscriptionService {
  async createCustomer(user) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user._id.toString()
      }
    });
    return customer;
  }

  async createSubscription(user, priceId, paymentMethodId) {
    try {
      // Get or create customer
      let customerId = user.subscription?.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;
      }

      // Attach payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user
      const tier = Object.keys(SUBSCRIPTION_TIERS).find(
        key => SUBSCRIPTION_TIERS[key].priceId === priceId
      );

      await User.findByIdAndUpdate(user._id, {
        'subscription.stripeCustomerId': customerId,
        'subscription.stripePriceId': priceId,
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.status': subscription.status,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.tier': tier,
        'subscription.features': SUBSCRIPTION_TIERS[tier].features
      });

      return subscription;
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(user) {
    try {
      if (!user.subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const subscription = await stripe.subscriptions.del(
        user.subscription.stripeSubscriptionId
      );

      await User.findByIdAndUpdate(user._id, {
        'subscription.status': 'canceled',
        'subscription.tier': 'free',
        'subscription.features': SUBSCRIPTION_TIERS.free.features
      });

      return subscription;
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }
}

module.exports = new SubscriptionService();