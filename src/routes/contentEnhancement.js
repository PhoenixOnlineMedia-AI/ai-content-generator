const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const websiteService = require('../services/websiteService');
const ContentUtils = require('../utils/contentUtils');
const { validateContentRequest } = require('../middleware/validation');

// Content Analysis Endpoints
router.post('/analyze', auth, validateContentRequest, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Run all analyses in parallel
    const [
      readability,
      topics,
      sentiment,
      seoScore,
      keywordDensity,
      contentStructure
    ] = await Promise.all([
      aiService.analyzeReadability(content),
      aiService.extractTopics(content),
      aiService.analyzeSentiment(content),
      aiService.analyzeSEO(content),
      aiService.analyzeKeywordDensity(content),
      aiService.analyzeContentStructure(content)
    ]);

    res.json({
      readability,
      topics,
      sentiment,
      seoScore,
      keywordDensity,
      contentStructure
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error analyzing content',
      error: error.message 
    });
  }
});

// SEO Enhancement Endpoints
router.post('/enhance-seo', auth, validateContentRequest, async (req, res) => {
  try {
    const { content, keywords, targetLength } = req.body;
    
    const enhancedContent = await aiService.enhanceSEO(content, {
      keywords,
      targetLength,
      user: req.user
    });

    res.json({ enhancedContent });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error enhancing SEO',
      error: error.message 
    });
  }
});

// Content Structure Endpoints
router.post('/generate-structure', auth, async (req, res) => {
  try {
    const { type, data } = req.body;
    let result;

    switch(type) {
      case 'table':
        result = ContentUtils.generateTable(data.headers, data.rows);
        break;
      case 'faq':
        result = ContentUtils.generateFAQ(data.questions);
        break;
      case 'listicle':
        result = ContentUtils.generateListicle(data.items);
        break;
      default:
        throw new Error('Invalid structure type');
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating structure',
      error: error.message 
    });
  }
});

module.exports = router;