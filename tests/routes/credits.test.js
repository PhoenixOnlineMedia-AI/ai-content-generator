const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

describe('Credit Routes', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      credits: 0
    });
    authToken = generateToken(testUser._id);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/credits/purchase', () => {
    it('should create payment intent for credit purchase', async () => {
      const response = await request(app)
        .post('/api/credits/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          packageId: 'small'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('clientSecret');
    });

    it('should reject invalid package ID', async () => {
      const response = await request(app)
        .post('/api/credits/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          packageId: 'invalid'
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/credits/balance', () => {
    it('should return user credit balance', async () => {
      const response = await request(app)
        .get('/api/credits/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('credits');
    });
  });

  describe('GET /api/credits/packages', () => {
    it('should return available credit packages', async () => {
      const response = await request(app)
        .get('/api/credits/packages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('small');
      expect(response.body).toHaveProperty('medium');
      expect(response.body).toHaveProperty('large');
    });
  });
});