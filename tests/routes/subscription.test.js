const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

describe('Subscription Endpoints', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    authToken = generateToken(testUser._id);
  });

  describe('POST /api/subscription/create', () => {
    it('should create a new subscription', async () => {
      const response = await request(app)
        .post('/api/subscription/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priceId: 'price_test',
          paymentMethodId: 'pm_test'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subscription');
    });
  });

  describe('GET /api/subscription/plans', () => {
    it('should return available subscription plans', async () => {
      const response = await request(app)
        .get('/api/subscription/plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});