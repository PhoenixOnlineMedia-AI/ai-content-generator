const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const usageTrackingService = require('../services/usageTrackingService');
const analyticsService = require('../services/analyticsService');
const competitiveAnalysisService = require('../services/competitiveAnalysis');

// Dashboard Overview
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { timeframe } = req.query;
    const metrics = await analyticsService.getUsageMetrics(
      req.user._id,
      timeframe
    );
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dashboard metrics',
      error: error.message 
    });
  }
});

// Detailed Usage Report
router.get('/usage-report', auth, async (req, res) => {
  try {
    const { timeframe } = req.query;
    const report = await usageTrackingService.generateUsageReport(
      req.user._id, 
      timeframe
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating usage report',
      error: error.message 
    });
  }
});

// Competitor Insights
router.get('/competitor-insights', auth, async (req, res) => {
  try {
    const insights = await competitiveAnalysisService.getCompetitorInsights(
      req.user._id
    );
    res.json(insights);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching competitor insights',
      error: error.message 
    });
  }
});

// Content Performance
router.get('/content-performance', auth, async (req, res) => {
  try {
    const { timeframe, contentId } = req.query;
    const performance = await analyticsService.getContentPerformance(
      req.user._id,
      contentId,
      timeframe
    );
    res.json(performance);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching content performance',
      error: error.message 
    });
  }
});

// Credit Usage Analytics
router.get('/credit-usage', auth, async (req, res) => {
  try {
    const { timeframe } = req.query;
    const creditAnalytics = await analyticsService.getCreditUsageAnalytics(
      req.user._id,
      timeframe
    );
    res.json(creditAnalytics);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching credit usage analytics',
      error: error.message 
    });
  }
});

module.exports = router;