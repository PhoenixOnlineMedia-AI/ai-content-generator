const CreditService = require('../../src/services/creditService');
const User = require('../../src/models/User');
const mongoose = require('mongoose');

describe('CreditService', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      credits: 0,
      subscription: {
        tier: 'free',
        status: 'active'
      }
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('purchaseCredits', () => {
    it('should create a payment intent for credit purchase', async () => {
      const result = await CreditService.purchaseCredits(
        testUser._id,
        'small'
      );
      
      expect(result).toHaveProperty('clientSecret');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('credits');
    });

    it('should throw error for invalid package', async () => {
      await expect(
        CreditService.purchaseCredits(testUser._id, 'invalid')
      ).rejects.toThrow('Invalid credit package');
    });
  });

  describe('addCreditsToUser', () => {
    it('should add credits to user account', async () => {
      const initialCredits = testUser.credits;
      const creditsToAdd = 100;
      
      const updatedCredits = await CreditService.addCreditsToUser(
        testUser._id,
        creditsToAdd,
        'purchase'
      );

      expect(updatedCredits).toBe(initialCredits + creditsToAdd);
    });

    it('should log credit transaction', async () => {
      const creditsToAdd = 100;
      await CreditService.addCreditsToUser(
        testUser._id,
        creditsToAdd,
        'purchase'
      );

      const transaction = await CreditTransaction.findOne({
        user: testUser._id
      });

      expect(transaction).toBeDefined();
      expect(transaction.credits).toBe(creditsToAdd);
    });
  });

  describe('upgradeUserTier', () => {
    it('should upgrade user tier and add corresponding credits', async () => {
      const result = await CreditService.upgradeUserTier(
        testUser._id,
        'pro'
      );

      const updatedUser = await User.findById(testUser._id);
      
      expect(result.success).toBe(true);
      expect(updatedUser.subscription.tier).toBe('pro');
      expect(updatedUser.credits).toBe(CreditService.tierCredits.pro);
    });

    it('should handle downgrade correctly', async () => {
      // First upgrade to pro
      await CreditService.upgradeUserTier(testUser._id, 'pro');
      
      // Then downgrade to basic
      const result = await CreditService.upgradeUserTier(
        testUser._id,
        'basic'
      );

      const updatedUser = await User.findById(testUser._id);
      
      expect(updatedUser.subscription.tier).toBe('basic');
      expect(updatedUser.credits).toBeLessThanOrEqual(
        CreditService.tierCredits.basic
      );
    });
  });
});