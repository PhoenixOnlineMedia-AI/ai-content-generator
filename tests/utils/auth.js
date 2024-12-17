const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');

const generateTestToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );
};

const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    credits: 100,
    role: 'user',
    ...overrides
  };

  const user = await User.create(defaultUser);
  const token = generateTestToken(user._id);

  return { user, token };
};

const createAdminUser = async (overrides = {}) => {
  return createTestUser({ role: 'admin', ...overrides });
};

module.exports = {
  generateTestToken,
  createTestUser,
  createAdminUser
};