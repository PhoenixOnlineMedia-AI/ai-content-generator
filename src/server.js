require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { handleError } = require('./utils/errorHandler');
const setupSwagger = require('./config/swagger');
const analyticsRoutes = require('./routes/analytics');
const teamRoutes = require('./routes/team');

const app = express();

app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const contentEnhancementRoutes = require('./routes/contentEnhancement');
const serpAnalysisRoutes = require('./routes/serpAnalysis');
const analyticsRoutes = require('./routes/analytics');
const apiKeyRoutes = require('./routes/apiKeys');
const subscriptionRoutes = require('./routes/subscription');
const webhookRoutes = require('./routes/webhook');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/enhance', contentEnhancementRoutes);
app.use('/api/serp', serpAnalysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/webhook', webhookRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Content Generator API' });
});

// Setup Swagger
setupSwagger(app);

// Handle undefined routes
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Error handling middleware (single handler)
app.use(handleError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;