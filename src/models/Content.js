const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['blog', 'social', 'email', 'sms', 'newsletter', 'press'],
    required: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  seoMetadata: {
    title: String,
    description: String,
    keywords: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;