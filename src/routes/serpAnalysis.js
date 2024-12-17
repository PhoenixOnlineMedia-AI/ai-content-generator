const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const serpAnalysisService = require('../services/serpAnalysisService');
const User = require('../models/User');

// Middleware to check SERP credits
const checkSerpCredits = async (req, res, next) => {
  try {
    if (req.user.apiKeys?.serpApi?.enabled || req.user.apiKeys?.scrapingBee?.enabled) {
      return next();
    }

    if (req.user.serpCredits <= 0) {
      return res.status(403).json({ 
        message: 'Insufficient SERP credits. Please upgrade your plan or add your own API key.' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking credits' });
  }
};

// SERP Analysis endpoint
router.post('/analyze', auth, checkSerpCredits, async (req, res) => {
  try {
    const { keyword, service = 'serpapi' } = req.body;
    let results;

    if (service === 'serpapi') {
      results = await serpAnalysisService.searchWithSerpApi(keyword, req.user);
    } else {
      results = await serpAnalysisService.searchWithScrapingBee(keyword, req.user);
    }

    // Deduct credits if using default API key
    if (!req.user.apiKeys[service]?.enabled) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { serpCredits: -1 }
      });
    }

    // Track API usage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { [`apiKeys.${service}.usage`]: 1 }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error analyzing SERP',
      error: error.message 
    });
  }
});

// Add API key
router.post('/api-key', auth, async (req, res) => {
  try {
    const { service, apiKey } = req.body;
    
    if (!['serpapi', 'scrapingbee'].includes(service)) {
      return res.status(400).json({ message: 'Invalid service' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      [`apiKeys.${service}.key`]: apiKey,
      [`apiKeys.${service}.enabled`]: true
    });

    res.json({ message: `${service} API key added successfully` });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding API key',
      error: error.message 
    });
  }
});

// Get API usage stats
router.get('/usage', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('apiKeys.serpApi.usage apiKeys.scrapingBee.usage serpCredits');
    
    res.json({
      serpApiUsage: user.apiKeys.serpApi.usage,
      scrapingBeeUsage: user.apiKeys.scrapingBee.usage,
      remainingCredits: user.serpCredits
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching usage stats',
      error: error.message 
    });
  }
});

module.exports = router;