const User = require('../../src/models/User');

describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    await user.save();
    expect(user.password).not.toBe('password123');
  });
});