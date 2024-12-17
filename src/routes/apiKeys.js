const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');

router.post('/generate', auth, async (req, res) => {
  try {
    const { provider, models } = req.body;
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    await User.findByIdAndUpdate(req.user._id, {
      [`apiKeys.${provider}.key`]: hash,
      [`apiKeys.${provider}.enabled`]: true,
      [`apiKeys.${provider}.selectedModels`]: models
    });
    
    // Only send the unhashed key once
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ message: 'Error generating API key' });
  }
});

module.exports = router;