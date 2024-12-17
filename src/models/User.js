const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  credits: {
    type: Number,
    default: 0
  },
  settings: {
    type: Map,
    of: String,
    default: {}
  },
  apiKeys: {
    openai: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]  // ['gpt-4', 'gpt-3.5-turbo']
    },
    anthropic: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]  // ['claude-3-opus', 'claude-3-sonnet']
    },
    openrouter: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]  // ['mistral-large', 'mixtral-8x7b']
    },
    perplexity: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]  // ['pplx-7b', 'pplx-70b']
    }
  },
  apiSettings: {
    useOwnKeys: { type: Boolean, default: false },
    defaultProvider: { 
      type: String, 
      enum: ['openai', 'anthropic', 'openrouter', 'perplexity'],
      default: 'openai'
    },
    defaultModel: { type: String }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;