const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  stripeCustomerId: { type: String },
  stripePriceId: { type: String },
  stripeSubscriptionId: { type: String },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing'],
    default: 'trialing'
  },
  currentPeriodEnd: Date,
  tier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'agency'],
    default: 'free'
  },
  features: {
    monthlyCredits: { type: Number, default: 0 },
    maxWebsites: { type: Number, default: 0 },
    maxTeamMembers: { type: Number, default: 1 },
    internalLinking: { type: Boolean, default: false },
    advancedSeo: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false }
  }
});

// User Schema
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
      selectedModels: [{ type: String }]
    },
    anthropic: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]
    },
    openrouter: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]
    },
    perplexity: {
      key: { type: String, select: false },
      enabled: { type: Boolean, default: false },
      selectedModels: [{ type: String }]
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
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  websites: [{
    url: String,
    name: String,
    sitemap: String,
    competitors: [String],
    lastScanned: Date
  }]
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