const CreditTransaction = require('../../src/models/CreditTransaction');
const User = require('../../src/models/User');
const mongoose = require('mongoose');

describe('CreditTransaction Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await CreditTransaction.deleteMany({});
  });

  it('should create a credit transaction successfully', async () => {
    const transaction = await CreditTransaction.create({
      user: testUser._id,
      credits: 100,
      source: 'purchase',
      timestamp: new Date()
    });

    expect(transaction).toBeDefined();
    expect(transaction.credits).toBe(100);
    expect(transaction.source).toBe('purchase');
  });

  it('should require a user reference', async () => {
    await expect(
      CreditTransaction.create({
        credits: 100,
        source: 'purchase'
      })
    ).rejects.toThrow();
  });
});