const crypto = require('crypto');

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ message: 'API key required' });
    }
    
    // Hash the API key before comparing
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Add the validated user to the request object
    req.apiUser = await User.findOne({ 'apiKeys.hash': hashedKey });
    if (!req.apiUser) {
      return res.status(403).json({ message: 'Invalid API key' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating API key' });
  }
};

module.exports = validateApiKey;