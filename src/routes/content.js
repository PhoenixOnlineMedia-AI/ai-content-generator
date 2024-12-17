const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Content = require('../models/Content');
const aiService = require('../services/aiService');

// Generate content using AI
router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt, type, keywords } = req.body;
    
    // Check user credits
    if (req.user.credits <= 0) {
      return res.status(403).json({ message: 'Insufficient credits' });
    }

    // Generate content
    const generatedContent = await aiService.generateContent(prompt, type, keywords);
    
    // Generate SEO metadata
    const seoMetadata = await aiService.generateSEOMetadata(generatedContent);

    // Create new content document
    const content = new Content({
      user: req.user._id,
      title: prompt,
      content: generatedContent,
      type,
      keywords,
      seoMetadata: {
        title: seoMetadata.title,
        description: seoMetadata.description,
        keywords: seoMetadata.keywords
      },
      status: 'draft'
    });

    await content.save();

    // Deduct credits
    req.user.credits -= 1;
    await req.user.save();

    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error generating content', error: error.message });
  }
});

// Create content
router.post('/', auth, async (req, res) => {
  try {
    const content = new Content({
      ...req.body,
      user: req.user._id
    });
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ message: 'Error creating content', error: error.message });
  }
});

// Get all content for user
router.get('/', auth, async (req, res) => {
  try {
    const content = await Content.find({ user: req.user._id });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

// Get single content by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

// Update content
router.patch('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    res.status(400).json({ message: 'Error updating content', error: error.message });
  }
});

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting content', error: error.message });
  }
});

const exportService = require('../services/exportService');

// Export content
router.get('/:id/export/:format', auth, async (req, res) => {
  try {
    const content = await Content.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    switch (req.params.format) {
      case 'pdf':
        const pdfDoc = await exportService.exportToPDF(content);
        res.setHeader('Content-Type', 'application/pdf');
        pdfDoc.pipe(res);
        break;
      
      case 'docx':
        const doc = await exportService.exportToWord(content);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        const buffer = await docx.Packer.toBuffer(doc);
        res.send(buffer);
        break;
      
      case 'html':
        const html = exportService.exportToHTML(content);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
        break;
      
      case 'txt':
        const text = exportService.exportToPlainText(content);
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
        break;
      
      default:
        res.status(400).json({ message: 'Unsupported format' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error exporting content', error: error.message });
  }
});

module.exports = router;