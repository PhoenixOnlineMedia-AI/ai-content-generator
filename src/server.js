require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Content Routes
const contentRoutes = require('./routes/content');
app.use('/api/content', contentRoutes);

// Content Enhancement Routes
const contentEnhancementRoutes = require('./routes/contentEnhancement');
app.use('/api/enhance', contentEnhancementRoutes);

// API Key Routes
const apiKeyRoutes = require('./routes/apiKeys');
app.use('/api/keys', apiKeyRoutes);

// Subscription Routes
const subscriptionRoutes = require('./routes/subscription');
app.use('/api/subscription', subscriptionRoutes);

// Webhook Routes
const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Content Generator API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});